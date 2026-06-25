import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Badge, Card, Spinner } from "react-bootstrap";
import ProfileAvatar from "../components/ProfileAvatar";
import StatusDot from "../components/StatusDot";
import { usePresence } from "../context/PresenceContext";
import { getUserById } from "../services/userService";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.$oid || String(value);
};

const getDisplayName = (user) => {
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  return fullName || user?.email || "CodeBloggs user";
};

const UserProfilePage = () => {
  const { id } = useParams();
  const { isActive } = usePresence();
  const [user, setUser] = useState(null);
  const [pageStatus, setPageStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    setPageStatus("loading");
    setError("");

    getUserById(id)
      .then(({ user: fetched }) => {
        if (!isCurrent) return;
        if (!fetched) {
          setError("User not found.");
          setPageStatus("error");
          return;
        }
        setUser(fetched);
        setPageStatus("ready");
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError(err.message || "Failed to load user profile.");
        setPageStatus("error");
      });

    return () => {
      isCurrent = false;
    };
  }, [id]);

  const userId = getId(user?._id) || id;
  const isUserActive = isActive(userId);

  if (pageStatus === "loading") {
    return (
      <section
        aria-live="polite"
        className="user-profile-page user-profile-page--centered"
      >
        <Spinner animation="border" role="status" />
        <span>Loading profile...</span>
      </section>
    );
  }

  if (pageStatus === "error") {
    return (
      <section className="user-profile-page user-profile-page--centered">
        <Alert variant="danger">{error}</Alert>
      </section>
    );
  }

  return (
    <section className="user-profile-page">
      <Card className="home-profile">
        <Card.Body>
          <div className="avatar-presence avatar-presence--stacked">
            <ProfileAvatar className="home-profile__avatar" user={user} />
            <div className="home-profile__status">
              <span className="home-profile__status-label">
                STATUS: {isUserActive ? "Active" : "Offline"}
              </span>
              <StatusDot userId={userId} placement="inline" />
            </div>
          </div>
          <Card.Title as="h1" className="home-profile__name">
            {getDisplayName(user)}
          </Card.Title>
          <div className="home-profile__meta">
            {user?.occupation ? <span>{user.occupation}</span> : null}
            {user?.location ? <span>{user.location}</span> : null}
            {user?.email ? <span>{user.email}</span> : null}
          </div>
          <Badge bg="secondary" className="home-profile__badge">
            {user?.auth_level || "basic"} account
          </Badge>
        </Card.Body>
      </Card>
    </section>
  );
};

export default UserProfilePage;
