import { useEffect, useMemo, useState } from "react";
import { Badge, Card, Col, Row, Spinner } from "react-bootstrap";
import AutoDismissAlert from "../components/AutoDismissAlert";
import ProfileAvatar from "../components/ProfileAvatar";
import StatusDot from "../components/StatusDot";
import { getPosts } from "../services/postService";
import { getUsers } from "../services/userService";

const getId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.$oid || String(value);
};

const parseDateValue = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getPostDate = (post) =>
  parseDateValue(post?.time_stamp || post?.post_date || post?.createdAt);

const formatDate = (value) => {
  const date = parseDateValue(value);

  if (!date) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const getDisplayName = (user) => {
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  return fullName || user?.email || "CodeBloggs user";
};

const getInitials = (user) => {
  const first = user?.first_name?.trim()?.[0] || "";
  const last = user?.last_name?.trim()?.[0] || "";
  const email = user?.email?.trim()?.[0] || "";

  return `${first}${last}`.toUpperCase() || email.toUpperCase() || "CB";
};

const getPostContent = (post) =>
  post?.content || post?.message || post?.body || "This post has no content.";

const Network = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const loadNetworkData = async () => {
      setStatus("loading");
      setError("");

      try {
        const [usersResult, postsResult] = await Promise.all([getUsers(), getPosts()]);

        if (!isCurrent) {
          return;
        }

        setUsers(usersResult.users);
        setPosts(postsResult.posts);
        setStatus("success");
      } catch (loadError) {
        if (!isCurrent) {
          return;
        }

        setError(loadError.message || "Unable to load the CodeBloggs network.");
        setStatus("error");
      }
    };

    loadNetworkData();
    window.addEventListener("codebloggs:post-created", loadNetworkData);

    return () => {
      isCurrent = false;
      window.removeEventListener("codebloggs:post-created", loadNetworkData);
    };
  }, []);

  const latestPostsByUserId = useMemo(() => {
    return posts.reduce((grouped, post) => {
      const userId = getId(post.user_id);
      const currentPost = grouped[userId];
      const postTime = getPostDate(post)?.getTime() || 0;
      const currentTime = getPostDate(currentPost)?.getTime() || 0;

      if (!currentPost || postTime > currentTime) {
        grouped[userId] = post;
      }

      return grouped;
    }, {});
  }, [posts]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) =>
      getDisplayName(a).localeCompare(getDisplayName(b), undefined, {
        sensitivity: "base",
      })
    );
  }, [users]);

  if (status === "loading") {
    return (
      <section className="network-page network-page--centered" aria-live="polite">
        <Spinner animation="border" className="network-page__spinner" role="status" />
        <span>Loading the CodeBloggs network...</span>
      </section>
    );
  }

  if (status === "error") {
    return (
      <AutoDismissAlert variant="danger" className="network-page__alert">
        {error}
      </AutoDismissAlert>
    );
  }

  return (
    <section className="network-page">
      <div className="network-page__header">
        <div>
          <h1>Network</h1>
          <p>Browse developers across the CodeBloggs community</p>
        </div>
        <span>{sortedUsers.length} users</span>
      </div>

      {sortedUsers.length === 0 ? (
        <Card className="network-empty">
          <Card.Body>
            <Card.Title>No users found</Card.Title>
            <Card.Text>
              CodeBloggs users will appear here after accounts are created.
            </Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {sortedUsers.map((user) => {
            const userId = getId(user._id);
            const latestPost = latestPostsByUserId[userId];
            const profileDetails = [
              user.occupation,
              user.location,
              user.email,
            ].filter(Boolean);

            return (
              <Col md={6} xl={4} key={userId || user.email}>
                <Card className="network-card h-100">
                  <Card.Body>
                    <div className="network-card__topline">
                      <div className="avatar-presence">
                        <ProfileAvatar
                          className="network-card__avatar"
                          fallbackInitials={getInitials(user)}
                          user={user}
                        />
                        <StatusDot userId={userId} placement="corner" />
                      </div>
                      <div>
                        <Card.Title as="h2" className="network-card__name">
                          {getDisplayName(user)}
                        </Card.Title>
                        <div className="network-card__badges">
                          <Badge bg="secondary">{user.auth_level || "basic"}</Badge>
                        </div>
                      </div>
                    </div>

                    {profileDetails.length > 0 ? (
                      <dl className="network-card__details">
                        {user.occupation ? (
                          <>
                            <dt>Occupation</dt>
                            <dd>{user.occupation}</dd>
                          </>
                        ) : null}
                        {user.location ? (
                          <>
                            <dt>Location</dt>
                            <dd>{user.location}</dd>
                          </>
                        ) : null}
                        {user.email ? (
                          <>
                            <dt>Email</dt>
                            <dd>{user.email}</dd>
                          </>
                        ) : null}
                      </dl>
                    ) : (
                      <p className="network-card__muted">No profile details available.</p>
                    )}

                    <div className="network-card__latest">
                      <h3>Latest post</h3>
                      {latestPost ? (
                        <>
                          <p>{getPostContent(latestPost)}</p>
                          <span>
                            {formatDate(
                              latestPost.time_stamp ||
                                latestPost.post_date ||
                                latestPost.createdAt
                            )}
                          </span>
                        </>
                      ) : (
                        <p className="network-card__muted">
                          This developer has not posted yet.
                        </p>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </section>
  );
};

export default Network;
