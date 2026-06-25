import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Form, Spinner } from "react-bootstrap";
import AutoDismissAlert from "../components/AutoDismissAlert";
import ProfileAvatar from "../components/ProfileAvatar";
import StatusDot from "../components/StatusDot";
import { FaRegThumbsUp, FaRegTrashAlt, FaThumbsUp } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import {
  createComment,
  deleteComment,
  getComments,
  updateCommentLikes,
} from "../services/commentService";
import { getPosts, updatePostLikes } from "../services/postService";
import { createReply, getReplies, updateReplyLikes } from "../services/replyService";
import { hasLocalLike, setLocalLike } from "../services/socialInteractionService";
import { fetchUsers } from "../redux/actions/userActions";
import { selectUsersById } from "../redux/selectors/userSelectors";

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

const getInitials = (user) => {
  const first = user?.first_name?.trim()?.[0] || "";
  const last = user?.last_name?.trim()?.[0] || "";
  const email = user?.email?.trim()?.[0] || "";

  return `${first}${last}`.toUpperCase() || email.toUpperCase() || "CB";
};

const getDisplayName = (user) => {
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  return fullName || user?.email || "CodeBloggs user";
};

const getPostContent = (post) =>
  post?.content || post?.message || post?.body || "This post has no content.";

const getCommentContent = (comment) =>
  comment?.content || comment?.message || comment?.body || "Comment unavailable.";

const MAX_REPLY_DEPTH = 3;

const Blogs = () => {
  const { user: sessionUser } = useAuth();
  const dispatch = useDispatch();
  const usersById = useSelector(selectUsersById);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [likingPostId, setLikingPostId] = useState("");
  const [likingCommentId, setLikingCommentId] = useState("");
  const [likingReplyId, setLikingReplyId] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentingPostId, setCommentingPostId] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [activeReplyTargetId, setActiveReplyTargetId] = useState("");
  const [openCommentPostIds, setOpenCommentPostIds] = useState({});
  const [openReplyParentIds, setOpenReplyParentIds] = useState({});
  const [replies, setReplies] = useState([]);
  const [localReplies, setLocalReplies] = useState({});

  const userId = getId(sessionUser?._id);

  useEffect(() => {
    let isCurrent = true;

    dispatch(fetchUsers());

    const loadBlogsData = async () => {
      setStatus("loading");
      setError("");

      try {
        const [postsResult, commentsResult, repliesResult] = await Promise.all([
          getPosts(),
          getComments(),
          getReplies(),
        ]);

        if (!isCurrent) {
          return;
        }

        setPosts(postsResult.posts);
        setComments(commentsResult.comments);
        setReplies(repliesResult.replies);
        setStatus("success");
      } catch (loadError) {
        if (!isCurrent) {
          return;
        }

        setError(loadError.message || "Unable to load the blogs feed.");
        setStatus("error");
      }
    };

    loadBlogsData();
    window.addEventListener("codebloggs:post-created", loadBlogsData);

    return () => {
      isCurrent = false;
      window.removeEventListener("codebloggs:post-created", loadBlogsData);
    };
  }, [dispatch]);

  const repliesByParentId = useMemo(() => {
    return replies.reduce((grouped, reply) => {
      const key = getId(reply.parent_id);

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(reply);
      return grouped;
    }, {});
  }, [replies]);

  const commentsByPostId = useMemo(() => {
    return comments.reduce((grouped, comment) => {
      const postId = getId(comment.post_id);

      if (!grouped[postId]) {
        grouped[postId] = [];
      }

      grouped[postId].push(comment);
      return grouped;
    }, {});
  }, [comments]);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const dateA = getPostDate(a)?.getTime() || 0;
      const dateB = getPostDate(b)?.getTime() || 0;
      return dateB - dateA;
    });
  }, [posts]);

  const getRepliesForParent = (parentId) => {
    const serverReplies = (repliesByParentId[parentId] || []).map(normalizeReply);
    const localOnlyReplies = localReplies[parentId] || [];
    return [...serverReplies, ...localOnlyReplies];
  };

  const getNestedReplyCount = (parentId) =>
    getRepliesForParent(parentId).reduce(
      (total, reply) => total + 1 + getNestedReplyCount(reply.id),
      0
    );

  const getPostCommentTotal = (postId, postComments) => {
    const serverReplyCount = replies.filter((reply) => getId(reply.post_id) === postId).length;
    const localReplyCount = Object.values(localReplies)
      .flat()
      .filter((reply) => reply.postId === postId).length;

    return postComments.length + serverReplyCount + localReplyCount;
  };

  const formatCount = (count, singular, plural = `${singular}s`) =>
    `${count} ${count === 1 ? singular : plural}`;

  const handleLike = async (post) => {
    const postId = getId(post._id);
    const liked = hasLocalLike({ type: "post", userId, itemId: postId });
    const likes = Number(post.likes || 0);

    if (liked && likes <= 0) {
      setLocalLike({ type: "post", userId, itemId: postId, liked: false });
      return;
    }

    setLikingPostId(postId);
    setError("");

    try {
      const likesDelta = liked ? -1 : 1;
      const result = await updatePostLikes(postId, likesDelta);
      const updatedPost =
        result.post || { ...post, likes: Math.max(0, likes + likesDelta) };

      setLocalLike({ type: "post", userId, itemId: postId, liked: !liked });

      setPosts((currentPosts) =>
        currentPosts.map((currentPost) =>
          getId(currentPost._id) === postId ? updatedPost : currentPost
        )
      );
    } catch (likeError) {
      setError(likeError.message || "Unable to update this post's likes.");
    } finally {
      setLikingPostId("");
    }
  };

  const handleCommentLike = async (comment) => {
    const commentId = getId(comment._id);
    const liked = hasLocalLike({ type: "comment", userId, itemId: commentId });
    const likes = Number(comment.likes || 0);

    if (liked && likes <= 0) {
      setLocalLike({ type: "comment", userId, itemId: commentId, liked: false });
      return;
    }

    setLikingCommentId(commentId);
    setError("");

    try {
      const likesDelta = liked ? -1 : 1;
      const result = await updateCommentLikes(commentId, likesDelta);
      const updatedComment =
        result.comment || { ...comment, likes: Math.max(0, likes + likesDelta) };

      setLocalLike({ type: "comment", userId, itemId: commentId, liked: !liked });

      setComments((currentComments) =>
        currentComments.map((currentComment) =>
          getId(currentComment._id) === commentId ? updatedComment : currentComment
        )
      );
    } catch (likeError) {
      setError(likeError.message || "Unable to update this comment's likes.");
    } finally {
      setLikingCommentId("");
    }
  };

  const handleCommentDraftChange = (postId, value) => {
    setCommentDrafts((currentDrafts) => ({
      ...currentDrafts,
      [postId]: value,
    }));
  };

  const handleCommentSectionToggle = (postId) => {
    setOpenCommentPostIds((currentPostIds) => ({
      ...currentPostIds,
      [postId]: !currentPostIds[postId],
    }));
  };

  const handleCommentSubmit = async (event, postId) => {
    event.preventDefault();

    const content = commentDrafts[postId]?.trim();
    if (!content) {
      setError("Write a comment before posting it.");
      return;
    }

    setCommentingPostId(postId);
    setError("");

    try {
      const result = await createComment({ postId, content });

      if (result.comment) {
        setComments((currentComments) => [...currentComments, result.comment]);
      } else {
        const commentsResult = await getComments();
        setComments(commentsResult.comments);
      }

      setCommentDrafts((currentDrafts) => ({
        ...currentDrafts,
        [postId]: "",
      }));
      setOpenCommentPostIds((currentPostIds) => ({
        ...currentPostIds,
        [postId]: true,
      }));
    } catch (commentError) {
      setError(commentError.message || "Unable to add your comment.");
    } finally {
      setCommentingPostId("");
    }
  };

  const handleCommentDelete = async (comment) => {
    const commentId = getId(comment._id);
    if (!commentId) {
      return;
    }

    setDeletingCommentId(commentId);
    setError("");

    try {
      await deleteComment(commentId);
      setComments((currentComments) =>
        currentComments.filter((currentComment) => getId(currentComment._id) !== commentId)
      );
      setReplies((currentReplies) =>
        currentReplies.filter(
          (reply) =>
            getId(reply.root_comment_id) !== commentId &&
            getId(reply.parent_id) !== commentId
        )
      );
      setLocalReplies((currentReplies) =>
        Object.entries(currentReplies).reduce((nextReplies, [parentId, replyList]) => {
          if (parentId !== commentId) {
            const keptReplies = replyList.filter(
              (reply) => reply.rootCommentId !== commentId && reply.parentId !== commentId
            );

            if (keptReplies.length > 0) {
              nextReplies[parentId] = keptReplies;
            }
          }

          return nextReplies;
        }, {})
      );
      setOpenReplyParentIds((currentParentIds) => {
        const nextParentIds = { ...currentParentIds };
        delete nextParentIds[commentId];
        return nextParentIds;
      });
      setActiveReplyTargetId((currentParentId) =>
        currentParentId === commentId ? "" : currentParentId
      );
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete this comment.");
    } finally {
      setDeletingCommentId("");
    }
  };

  const handleReplyDraftChange = (parentId, value) => {
    setReplyDrafts((currentDrafts) => ({
      ...currentDrafts,
      [parentId]: value,
    }));
  };

  const handleReplyToggle = (parentId) => {
    setActiveReplyTargetId((currentParentId) =>
      currentParentId === parentId ? "" : parentId
    );
  };

  const handleReplyThreadToggle = (parentId) => {
    setOpenReplyParentIds((currentParentIds) => ({
      ...currentParentIds,
      [parentId]: !currentParentIds[parentId],
    }));
  };

  const normalizeReply = (reply) => {
    const author = usersById[getId(reply.user_id)];
    return {
      id: getId(reply._id),
      parentId: getId(reply.parent_id),
      authorId: getId(reply.user_id),
      authorName: getDisplayName(author),
      authorInitials: getInitials(author),
      content: reply.content,
      timestamp: reply.time_stamp,
      likes: reply.likes || 0,
      likedByCurrentUser: hasLocalLike({ type: "reply", userId, itemId: getId(reply._id) }),
      depth: reply.depth || 1,
      isServerReply: true,
    };
  };

  const handleReplySubmit = async (event, parentId, parentDepth, postId, rootCommentId) => {
    event.preventDefault();

    const content = replyDrafts[parentId]?.trim();
    if (!content) {
      setError("Write a reply before posting it.");
      return;
    }

    const parentType = parentId === rootCommentId ? "Comment" : "Reply";
    const depth = Math.min(parentDepth + 1, MAX_REPLY_DEPTH);

    const localId = `local-reply-${parentId}-${Date.now()}`;
    const localReply = {
      id: localId,
      parentId,
      authorId: getId(sessionUser?._id) || userId,
      authorName: getDisplayName(sessionUser),
      authorInitials: getInitials(sessionUser),
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedByCurrentUser: false,
      depth,
      postId,
      rootCommentId,
      isServerReply: false,
    };

    setLocalReplies((curr) => ({
      ...curr,
      [parentId]: [...(curr[parentId] || []), localReply],
    }));
    setReplyDrafts((curr) => ({ ...curr, [parentId]: "" }));
    setActiveReplyTargetId("");
    setOpenCommentPostIds((curr) => ({ ...curr, [postId]: true }));
    setOpenReplyParentIds((curr) => ({ ...curr, [parentId]: true }));
    setError("");

    try {
      const result = await createReply({
        parentId,
        parentType,
        rootCommentId,
        postId,
        content,
        depth,
      });

      if (result.reply) {
        setReplies((curr) => [...curr, result.reply]);
        setLocalReplies((curr) => ({
          ...curr,
          [parentId]: (curr[parentId] || []).filter((r) => r.id !== localId),
        }));
      }
    } catch (replyError) {
      setError(replyError.message || "Unable to post your reply.");
      setLocalReplies((curr) => ({
        ...curr,
        [parentId]: (curr[parentId] || []).filter((r) => r.id !== localId),
      }));
    }
  };

  const handleReplyLike = async (reply) => {
    const replyLiked =
      reply.likedByCurrentUser ||
      hasLocalLike({ type: "reply", userId, itemId: reply.id });
    const likesDelta = replyLiked ? -1 : 1;

    setLocalLike({ type: "reply", userId, itemId: reply.id, liked: !replyLiked });

    if (reply.isServerReply) {
      setLikingReplyId(reply.id);
      try {
        const result = await updateReplyLikes(reply.id, likesDelta);
        if (result.reply) {
          setReplies((curr) =>
            curr.map((r) => (getId(r._id) === reply.id ? result.reply : r))
          );
        }
      } catch {
        setLocalLike({ type: "reply", userId, itemId: reply.id, liked: replyLiked });
      } finally {
        setLikingReplyId("");
      }
    } else {
      setLocalReplies((currentReplies) =>
        Object.entries(currentReplies).reduce((nextReplies, [parentId, replyList]) => {
          nextReplies[parentId] = replyList.map((r) =>
            r.id === reply.id
              ? {
                  ...r,
                  likes: Math.max(0, Number(r.likes || 0) + likesDelta),
                  likedByCurrentUser: !replyLiked,
                }
              : r
          );
          return nextReplies;
        }, {})
      );
    }
  };

  const renderReplyForm = (parentId, parentDepth, postId, rootCommentId) =>
    activeReplyTargetId === parentId ? (
      <Form
        className="social-replies__form"
        onSubmit={(event) => handleReplySubmit(event, parentId, parentDepth, postId, rootCommentId)}
      >
        <Form.Control
          as="textarea"
          aria-label="Add a reply"
          onChange={(event) => handleReplyDraftChange(parentId, event.target.value)}
          placeholder="Add a reply"
          rows={2}
          value={replyDrafts[parentId] || ""}
        />
        <Button
          disabled={!replyDrafts[parentId]?.trim()}
          size="sm"
          type="submit"
          variant="primary"
        >
          Reply
        </Button>
      </Form>
    ) : null;

  const renderReplyThreadToggle = (parentId) => {
    const replyCount = getNestedReplyCount(parentId);

    if (replyCount === 0) {
      return null;
    }

    return (
      <Button
        className="social-replies__toggle"
        onClick={() => handleReplyThreadToggle(parentId)}
        size="sm"
        type="button"
        variant="link"
      >
        {openReplyParentIds[parentId]
          ? "Hide replies"
          : `View ${formatCount(replyCount, "reply", "replies")}`}
      </Button>
    );
  };

  const renderReplies = (parentId, parentDepth = 0, postId, rootCommentId) => {
    const allReplies = getRepliesForParent(parentId);

    if (allReplies.length === 0) {
      return null;
    }

    if (!openReplyParentIds[parentId]) {
      return null;
    }

    return (
      <ul className="social-replies__list">
        {allReplies.map((reply) => {
          const replyLiked =
            reply.likedByCurrentUser ||
            hasLocalLike({ type: "reply", userId, itemId: reply.id });
          const replyDepth = Math.min(reply.depth || parentDepth + 1, MAX_REPLY_DEPTH);

          return (
            <li
              className={`social-replies__item social-replies__item--level-${replyDepth}`}
              key={reply.id}
            >
              <div className="social-replies__meta">
                <ProfileAvatar
                  className="social-replies__avatar"
                  fallbackInitials={reply.authorInitials}
                  user={reply.author || { _id: reply.authorId }}
                />
                <div>
                  <strong>{reply.authorName}</strong>
                  <span>{formatDate(reply.timestamp)}</span>
                </div>
              </div>
              <p>{reply.content}</p>
              <div className="social-comment__actions">
                <Button
                  aria-label={replyLiked ? "Unlike" : "Like"}
                  className="social-comment__action"
                  disabled={likingReplyId === reply.id}
                  onClick={() => handleReplyLike(reply)}
                  size="sm"
                  type="button"
                  variant={replyLiked ? "primary" : "outline-primary"}
                >
                  {replyLiked ? (
                    <FaThumbsUp aria-hidden="true" />
                  ) : (
                    <FaRegThumbsUp aria-hidden="true" />
                  )}
                  <span>{Number(reply.likes || 0)}</span>
                </Button>
                <Button
                  className="social-comment__action"
                  disabled={replyDepth >= MAX_REPLY_DEPTH}
                  onClick={() => handleReplyToggle(reply.id)}
                  size="sm"
                  type="button"
                  variant="outline-secondary"
                >
                  Reply
                </Button>
              </div>
              {renderReplyForm(reply.id, replyDepth, postId, rootCommentId)}
              {renderReplyThreadToggle(reply.id)}
              {renderReplies(reply.id, replyDepth, postId, rootCommentId)}
            </li>
          );
        })}
      </ul>
    );
  };

  if (status === "loading") {
    return (
      <section className="blogs-page blogs-page--centered" aria-live="polite">
        <Spinner animation="border" className="blogs-page__spinner" role="status" />
        <span>Loading bloggs...</span>
      </section>
    );
  }

  if (status === "error") {
    return (
      <AutoDismissAlert variant="danger" className="blogs-page__alert">
        {error}
      </AutoDismissAlert>
    );
  }

  return (
    <section className="blogs-page">
      {error ? (
        <AutoDismissAlert
          variant="warning"
          className="blogs-page__alert"
          onClose={() => setError("")}
        >
          {error}
        </AutoDismissAlert>
      ) : null}

      <div className="blogs-feed__header">
        <div>
          <h1>Bloggs</h1>
          <p>Latest posts from the CodeBloggs network</p>
        </div>
        <span>{sortedPosts.length} posts</span>
      </div>

      {sortedPosts.length === 0 ? (
        <Card className="blogs-empty">
          <Card.Body>
            <Card.Title>No bloggs yet</Card.Title>
            <Card.Text>Posts from the CodeBloggs network will appear here.</Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <div className="blogs-feed__list">
          {sortedPosts.map((post) => {
            const postId = getId(post._id);
            const author = usersById[getId(post.user_id)];
            const postComments = commentsByPostId[postId] || [];
            const postCommentTotal = getPostCommentTotal(postId, postComments);
            const isCommentSectionOpen = Boolean(openCommentPostIds[postId]);
            const postLiked = hasLocalLike({ type: "post", userId, itemId: postId });

            return (
              <Card className="blogs-post" key={postId}>
                <Card.Body>
                  <div className="blogs-post__author">
                    <div className="avatar-presence">
                      <ProfileAvatar
                        className="blogs-post__avatar"
                        fallbackInitials={getInitials(author)}
                        user={author}
                      />
                      <StatusDot userId={post.user_id} placement="corner" />
                    </div>
                    <div>
                      <h2>{getDisplayName(author)}</h2>
                      <span>
                        {formatDate(post.time_stamp || post.post_date || post.createdAt)}
                      </span>
                    </div>
                  </div>

                  <p className="blogs-post__content">{getPostContent(post)}</p>

                  <div className="post-interactions__summary">
                    <span>{formatCount(Number(post.likes || 0), "like")}</span>
                    <button
                      className="post-interactions__count"
                      onClick={() => handleCommentSectionToggle(postId)}
                      type="button"
                    >
                      {formatCount(postCommentTotal, "comment")}
                    </button>
                  </div>

                  <div className="blogs-post__actions">
                    <Button
                      aria-label={postLiked ? "Unlike" : "Like"}
                      className={`blogs-post__like ${
                        postLiked ? "blogs-post__like--active" : ""
                      }`}
                      disabled={likingPostId === postId}
                      onClick={() => handleLike(post)}
                      size="sm"
                      type="button"
                      variant={postLiked ? "primary" : "outline-primary"}
                    >
                      {postLiked ? (
                        <FaThumbsUp aria-hidden="true" />
                      ) : (
                        <FaRegThumbsUp aria-hidden="true" />
                      )}
                    </Button>
                    <Button
                      className="blogs-post__comment"
                      onClick={() => handleCommentSectionToggle(postId)}
                      size="sm"
                      type="button"
                      variant="outline-secondary"
                    >
                      Comment
                    </Button>
                  </div>

                  {isCommentSectionOpen ? (
                    <div className="blogs-comments">
                      <h3>Comments</h3>
                      <Form
                        className="blogs-comments__form"
                        onSubmit={(event) => handleCommentSubmit(event, postId)}
                      >
                        <Form.Control
                          as="textarea"
                          aria-label="Add a comment"
                          disabled={commentingPostId === postId}
                          onChange={(event) =>
                            handleCommentDraftChange(postId, event.target.value)
                          }
                          placeholder="Add a comment"
                          rows={2}
                          value={commentDrafts[postId] || ""}
                        />
                        <Button
                          disabled={
                            commentingPostId === postId || !commentDrafts[postId]?.trim()
                          }
                          size="sm"
                          type="submit"
                          variant="primary"
                        >
                          {commentingPostId === postId ? "Posting..." : "Comment"}
                        </Button>
                      </Form>
                      {postComments.length === 0 ? (
                        <p className="blogs-comments__empty">No comments yet.</p>
                      ) : (
                        <ul className="blogs-comments__list">
                          {postComments.map((comment) => {
                            const commentId = getId(comment._id);
                            const commentAuthor = usersById[getId(comment.user_id)];
                            const commentLiked = hasLocalLike({
                              type: "comment",
                              userId,
                              itemId: commentId,
                            });
                            const canDeleteComment = getId(comment.user_id) === userId;
                            return (
                              <li className="blogs-comments__item" key={commentId}>
                                <div className="blogs-comments__meta">
                                  <ProfileAvatar
                                    className="blogs-comments__avatar"
                                    fallbackInitials={getInitials(commentAuthor)}
                                    user={commentAuthor || { _id: getId(comment.user_id) }}
                                  />
                                  <div className="blogs-comments__identity">
                                    <strong>{getDisplayName(commentAuthor)}</strong>
                                    <span>
                                      {formatDate(comment.time_stamp || comment.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                <p>{getCommentContent(comment)}</p>
                                <div className="social-comment__actions">
                                  <Button
                                    aria-label={commentLiked ? "Unlike" : "Like"}
                                    className="social-comment__action"
                                    disabled={likingCommentId === commentId}
                                    onClick={() => handleCommentLike(comment)}
                                    size="sm"
                                    type="button"
                                    variant={commentLiked ? "primary" : "outline-primary"}
                                  >
                                    {commentLiked ? (
                                      <FaThumbsUp aria-hidden="true" />
                                    ) : (
                                      <FaRegThumbsUp aria-hidden="true" />
                                    )}
                                    <span>{Number(comment.likes || 0)}</span>
                                  </Button>
                                  <Button
                                    className="social-comment__action"
                                    onClick={() => handleReplyToggle(commentId)}
                                    size="sm"
                                    type="button"
                                    variant="outline-secondary"
                                  >
                                    Reply
                                  </Button>
                                  {canDeleteComment ? (
                                    <Button
                                      aria-label="Delete comment"
                                      className="social-comment__action social-comment__action--danger"
                                      disabled={deletingCommentId === commentId}
                                      onClick={() => handleCommentDelete(comment)}
                                      size="sm"
                                      type="button"
                                      variant="outline-danger"
                                    >
                                      <FaRegTrashAlt aria-hidden="true" />
                                      <span>
                                        {deletingCommentId === commentId
                                          ? "Deleting..."
                                          : "Delete"}
                                      </span>
                                    </Button>
                                  ) : null}
                                </div>

                                {renderReplyForm(commentId, 0, postId, commentId)}
                                {renderReplyThreadToggle(commentId)}
                                {renderReplies(commentId, 0, postId, commentId)}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Blogs;
