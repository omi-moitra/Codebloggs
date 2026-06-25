import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, Form, Overlay, Popover, Table } from "react-bootstrap";
import { BsCaretUpFill, BsFillCaretDownFill, BsChevronRight } from "react-icons/bs";
import { IoEyeOutline, IoTrashOutline } from "react-icons/io5";
import { TbCaretUpDownFilled } from "react-icons/tb";
import { fetchPosts, deletePostAction } from "../redux/actions/postActions";
import { fetchUsers } from "../redux/actions/userActions";
import { selectUsersById } from "../redux/selectors/userSelectors";
import { getComments, deleteComment } from "../services/commentService";
import { getReplies, deleteReply } from "../services/replyService";
import ConfirmModal from "../components/ConfirmModal";
import ProfileAvatar from "../components/ProfileAvatar";
import SkeletonTable from "../components/SkeletonTable";

const PAGE_SIZE_OPTIONS = [10, 15, 20];

const getPostLabel = (post) => {
  if (post.title && post.title.trim()) return post.title;
  if (post.content) {
    return post.content.length > 40
      ? post.content.slice(0, 40) + "…"
      : post.content;
  }
  return "(no content)";
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.$oid || String(value);
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

const getAuthorLabel = (post, usersById) => {
  const author = usersById[getId(post.user_id)];
  if (author) return getDisplayName(author);
  return String(post.user_id) || "Unknown";
};

const formatDate = (timestamp) => {
  if (!timestamp) return "—";
  try {
    return new Date(timestamp).toLocaleDateString("en-CA");
  } catch {
    return timestamp;
  }
};

const ContentManager = () => {
  const dispatch = useDispatch();

  const { posts, loading, error: storeError } = useSelector((state) => state.posts);
  const usersById = useSelector(selectUsersById);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [sortField, setSortField] = useState("time_stamp");
  const [sortDir, setSortDir] = useState("desc");

  const [previewState, setPreviewState] = useState(null);

  const [expandedPostIds, setExpandedPostIds] = useState(new Set());
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState([]);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deletingComment, setDeletingComment] = useState(false);
  const [deleteCommentError, setDeleteCommentError] = useState("");

  useEffect(() => {
    dispatch(fetchPosts());
    dispatch(fetchUsers());
    Promise.all([getComments(), getReplies()]).then(([cr, rr]) => {
      setComments(cr.comments);
      setReplies(rr.replies);
    });
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const commentsByPostId = useMemo(() =>
    comments.reduce((acc, c) => {
      const key = getId(c.post_id);
      (acc[key] = acc[key] || []).push(c);
      return acc;
    }, {}), [comments]);

  const repliesByCommentId = useMemo(() =>
    replies.reduce((acc, r) => {
      const key = getId(r.root_comment_id);
      (acc[key] = acc[key] || []).push(r);
      return acc;
    }, {}), [replies]);

  const filtered = useMemo(() => {
    if (!startDate && !endDate) return posts;
    return posts.filter((p) => {
      if (!p.time_stamp) return !startDate;
      const postDate = new Date(p.time_stamp).toLocaleDateString("en-CA");
      const afterStart = !startDate || postDate >= startDate;
      const beforeEnd = !endDate || postDate <= endDate;
      return afterStart && beforeEnd;
    });
  }, [posts, startDate, endDate]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal =
        sortField === "author"
          ? getAuthorLabel(a, usersById).toLowerCase()
          : (a[sortField] || "").toLowerCase();
      const bVal =
        sortField === "author"
          ? getAuthorLabel(b, usersById).toLowerCase()
          : (b[sortField] || "").toLowerCase();
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir, usersById]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const sortIndicator = (field) => {
    if (sortField !== field)
      return <TbCaretUpDownFilled className="user-manager__sort-icon user-manager__sort-icon--inactive" />;
    return sortDir === "asc"
      ? <BsCaretUpFill className="user-manager__sort-icon" />
      : <BsFillCaretDownFill className="user-manager__sort-icon" />;
  };

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const pageSlice = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSelectAll = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    setDeleting(true);
    setDeleteError("");

    const result = await dispatch(deletePostAction(postToDelete._id));

    setDeleting(false);
    setPostToDelete(null);

    if (!result.success) {
      setDeleteError(
        result.message || "Delete unavailable — backend update in progress."
      );
    }
  };

  const togglePost = (postId) => {
    setExpandedPostIds((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const handleDeleteCommentConfirm = async () => {
    if (!commentToDelete) return;
    setDeletingComment(true);
    setDeleteCommentError("");
    try {
      if (commentToDelete.type === "comment") {
        await deleteComment(commentToDelete.item._id);
        const id = getId(commentToDelete.item._id);
        setComments((prev) => prev.filter((c) => getId(c._id) !== id));
        setReplies((prev) => prev.filter((r) => getId(r.root_comment_id) !== id));
      } else {
        await deleteReply(commentToDelete.item._id);
        const id = getId(commentToDelete.item._id);
        setReplies((prev) => prev.filter((r) => getId(r._id) !== id));
      }
    } catch (err) {
      setDeleteCommentError(err.message || "Delete failed.");
    } finally {
      setDeletingComment(false);
      setCommentToDelete(null);
    }
  };

  return (
    <div className="content-manager">
      {storeError && !deleteError && (
        <Alert variant="danger" className="content-manager__alert">
          {storeError}
        </Alert>
      )}

      {deleteError && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setDeleteError("")}
          className="content-manager__alert"
        >
          {deleteError}
        </Alert>
      )}

      {deleteCommentError && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setDeleteCommentError("")}
          className="content-manager__alert"
        >
          {deleteCommentError}
        </Alert>
      )}

      <div className="content-manager__filter-row">
        <span className="content-manager__filter-label">From:</span>
        <Form.Control
          type="text"
          value={startDate}
          onChange={handleStartDateChange}
          placeholder="YYYY-MM-DD"
          aria-label="Filter from date"
          className="content-manager__date-input"
          disabled={loading}
        />
        <span className="content-manager__filter-label">To:</span>
        <Form.Control
          type="text"
          value={endDate}
          onChange={handleEndDateChange}
          placeholder="YYYY-MM-DD"
          aria-label="Filter to date"
          className="content-manager__date-input"
          disabled={loading}
        />
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={handleSelectAll}
          disabled={loading}
        >
          Clear
        </Button>
      </div>

      <Table
        striped
        bordered
        hover
        responsive
        className="content-manager__table"
      >
        <thead>
          <tr>
            <th
              style={{ cursor: "pointer" }}
              onClick={() => handleSort("author")}
              aria-sort={sortField === "author" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
            >
              <span className="user-manager__col-header">
                Author {sortIndicator("author")}
              </span>
            </th>
            <th>Post</th>
            <th
              style={{ cursor: "pointer" }}
              onClick={() => handleSort("time_stamp")}
              aria-sort={sortField === "time_stamp" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
            >
              <span className="user-manager__col-header">
                Date {sortIndicator("time_stamp")}
              </span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        {loading ? (
          <SkeletonTable rows={pageSize} cols={4} />
        ) : (
          <tbody>
            {pageSlice.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center content-manager__empty">
                  {startDate || endDate
                    ? "No posts match the selected date range."
                    : "No posts found."}
                </td>
              </tr>
            ) : (
              pageSlice.map((post) => {
                const isExpanded = expandedPostIds.has(post._id);
                const postComments = commentsByPostId[post._id] || [];
                return (
                  <React.Fragment key={post._id}>
                    <tr
                      onClick={() => togglePost(post._id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{getAuthorLabel(post, usersById)}</td>
                      <td className="content-manager__post-cell">
                        <BsChevronRight
                          className={`content-manager__caret${isExpanded ? " content-manager__caret--open" : ""}`}
                        />
                        {getPostLabel(post)}
                      </td>
                      <td>{formatDate(post.time_stamp)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            aria-label={`Preview post: ${getPostLabel(post)}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewState((prev) =>
                                prev?.post._id === post._id
                                  ? null
                                  : { post, el: e.currentTarget }
                              );
                            }}
                          >
                            <IoEyeOutline />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => setPostToDelete(post)}
                            aria-label={`Delete post: ${getPostLabel(post)}`}
                          >
                            <IoTrashOutline />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      postComments.length === 0 ? (
                        <tr key={`${post._id}-empty`}>
                          <td colSpan={4} className="content-manager__no-comments-cell">
                            No comments on this post.
                          </td>
                        </tr>
                      ) : (
                        postComments.flatMap((comment) => [
                          <tr key={`${comment._id}-c`} className="content-manager__comment-row">
                            <td colSpan={3} className="content-manager__comment-cell">
                              <span>{comment.content}</span>
                              <div className="content-manager__comment-meta">
                                {getAuthorLabel(comment, usersById)} · {formatDate(comment.time_stamp)}
                              </div>
                            </td>
                            <td className="content-manager__action-cell" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => setCommentToDelete({ type: "comment", item: comment })}
                                aria-label="Delete comment"
                              >
                                <IoTrashOutline />
                              </Button>
                            </td>
                          </tr>,
                          ...(repliesByCommentId[getId(comment._id)] || []).map((reply) => (
                            <tr key={`${reply._id}-r`} className="content-manager__reply-row">
                              <td colSpan={3} className="content-manager__reply-cell">
                                <span>{reply.content}</span>
                                <div className="content-manager__comment-meta">
                                  {getAuthorLabel(reply, usersById)} · {formatDate(reply.time_stamp)}
                                </div>
                              </td>
                              <td className="content-manager__action-cell" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => setCommentToDelete({ type: "reply", item: reply })}
                                  aria-label="Delete reply"
                                >
                                  <IoTrashOutline />
                                </Button>
                              </td>
                            </tr>
                          )),
                        ])
                      )
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        )}
      </Table>

      {sorted.length > 0 && !loading && (
        <div className="content-manager__pagination">
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            &larr; Prev
          </Button>

          <span className="content-manager__page-info">
            Page {page} of {totalPages}
          </span>

          <span className="content-manager__page-label">Show:</span>

          <Form.Select
            size="sm"
            className="content-manager__page-size"
            value={pageSize}
            onChange={handlePageSizeChange}
            aria-label="Results per page"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Form.Select>

          <Button
            variant="outline-secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next &rarr;
          </Button>
        </div>
      )}

      <Overlay
        show={Boolean(previewState)}
        target={previewState?.el}
        placement="left"
        rootClose
        onHide={() => setPreviewState(null)}
      >
        <Popover id="post-preview-popover" style={{ maxWidth: "300px" }}>
          <Popover.Header as="h6">Post Preview</Popover.Header>
          <Popover.Body>
            {previewState && (() => {
              const author = usersById[getId(previewState.post.user_id)];
              return (
              <>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <ProfileAvatar
                    user={author}
                    fallbackInitials={getInitials(author)}
                    className="content-manager__preview-avatar"
                  />
                  <div>
                    <p className="mb-0 fw-semibold small">{getDisplayName(author)}</p>
                    <p className="mb-0 text-muted small">{formatDate(previewState.post.time_stamp)}</p>
                  </div>
                </div>
                <p className="mb-3" style={{ maxHeight: "10rem", overflowY: "auto" }}>
                  {previewState.post.content || previewState.post.title || "(no content)"}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-100"
                  onClick={() =>
                    window.open(`/blogs#post-${previewState.post._id}`, "_blank")
                  }
                >
                  Open this post in a new tab
                </Button>
              </>
              );
            })()}
          </Popover.Body>
        </Popover>
      </Overlay>

      <ConfirmModal
        show={!!postToDelete}
        title="Delete Post"
        body={
          postToDelete ? (
            <>
              <p>Are you sure you want to delete this post?</p>
              <p>
                <em>&ldquo;{getPostLabel(postToDelete)}&rdquo;</em>
              </p>
              <p className="mb-0">This action cannot be undone.</p>
            </>
          ) : null
        }
        onCancel={() => setPostToDelete(null)}
        onConfirm={handleDeleteConfirm}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
        loadingLabel="Deleting…"
      />

      <ConfirmModal
        show={!!commentToDelete}
        title={commentToDelete?.type === "reply" ? "Delete Reply" : "Delete Comment"}
        body={
          commentToDelete ? (
            <>
              <p>
                Are you sure you want to delete this{" "}
                {commentToDelete.type}?
              </p>
              <p>
                <em>&ldquo;{commentToDelete.item.content?.slice(0, 80)}{commentToDelete.item.content?.length > 80 ? "…" : ""}&rdquo;</em>
              </p>
              {commentToDelete.type === "comment" && (
                <p>All replies to this comment will also be deleted.</p>
              )}
              <p className="mb-0">This action cannot be undone.</p>
            </>
          ) : null
        }
        onCancel={() => setCommentToDelete(null)}
        onConfirm={handleDeleteCommentConfirm}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deletingComment}
        loadingLabel="Deleting…"
      />
    </div>
  );
};

export default ContentManager;
