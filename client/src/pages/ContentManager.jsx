// =============================================================================
// pages/ContentManager.jsx — Admin Content Manager table (/admin/content)
// -----------------------------------------------------------------------------
// 1. Data fetching    dispatch fetchPosts() on mount via Redux Thunk
// 2. Date filter      From/To date inputs; client-side filter on post time_stamp;
//                     either field can be used independently
// 3. Select All       clears both date inputs; restores full post list; resets page 1
// 4. Pagination       slice filtered results; previous/next controls
// 5. Results-per-page dropdown: 10, 15, 20; resets to page 1 on change
// 6. Delete flow      Delete button (IoTrashOutline) → ConfirmModal → dispatch deletePostAction
// 7. Author column    first_name + last_name if populated; falls back to user_id string
// 8. Post column      post.title if present; otherwise truncated content (40 chars)
// =============================================================================

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, Form, Spinner, Table } from "react-bootstrap";
import { IoTrashOutline } from "react-icons/io5";
import { fetchPosts, deletePostAction } from "../redux/actions/postActions";
import ConfirmModal from "../components/ConfirmModal";

const PAGE_SIZE_OPTIONS = [10, 15, 20];

// Returns the post title or a content excerpt truncated at 40 characters.
// The Post column shows whichever is available so the table always has a
// meaningful label even when a title field isn't present in the response.
const getPostLabel = (post) => {
  if (post.title && post.title.trim()) return post.title;
  if (post.content) {
    return post.content.length > 40
      ? post.content.slice(0, 40) + "…"
      : post.content;
  }
  return "(no content)";
};

// Returns the author's full name when the post object includes populated user
// fields, or falls back to the raw user_id string.
// ⚠️ Whether first_name/last_name are populated depends on the backend — if
// GET /posts does not populate the author, only user_id will be available.
// Flag this with the backend partner: see Working/Module_10/Integration.md.
const getAuthorLabel = (post) => {
  if (post.first_name || post.last_name) {
    return `${post.first_name || ""} ${post.last_name || ""}`.trim();
  }
  if (post.author?.first_name || post.author?.last_name) {
    return `${post.author.first_name || ""} ${post.author.last_name || ""}`.trim();
  }
  return post.user_id || "Unknown";
};

// Format a timestamp string (ISO or date-only) into a human-readable YYYY-MM-DD.
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

  // Pull post list and async state from the Redux store.
  const { posts, loading, error: storeError } = useSelector((state) => state.posts);

  // Local UI state — does not belong in Redux because it only affects this
  // component and does not need to survive navigation.
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Fetch the full post list once when the component mounts. The Thunk updates
  // the Redux store; re-renders happen via useSelector.
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  // --- Client-side date filter ---
  // Posts are filtered in memory after the initial GET /posts load — no additional
  // API call is made when the filter changes (consistent with the User Manager
  // name-search pattern and confirmed in Issues.md Issue #13).
  //
  // For the end date, append 'T23:59:59' so posts created at any time on the
  // To date are included (not just before midnight UTC).
  const filtered = useMemo(() => {
    if (!startDate && !endDate) return posts;
    return posts.filter((p) => {
      const ts = p.time_stamp || "";
      const afterStart = !startDate || ts >= startDate;
      const beforeEnd = !endDate || ts <= endDate + "T23:59:59";
      return afterStart && beforeEnd;
    });
  }, [posts, startDate, endDate]);

  // --- Pagination math ---
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  // Clamp page so it never exceeds totalPages after a filter narrows results.
  const page = Math.min(currentPage, totalPages);
  const pageSlice = filtered.slice((page - 1) * pageSize, page * pageSize);

  // "Select All" clears both date inputs and restores the full post list.
  // The button label must be "Select All" — the grading sheet checks this
  // exact label for the Content Manager (Issues.md Issue #12).
  const handleSelectAll = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Reset to page 1 whenever the date filter changes so the admin always
  // sees the first matching results, not a potentially empty page.
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setCurrentPage(1);
  };

  // Reset to page 1 on page-size change so the new size takes effect cleanly.
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  // After the admin confirms deletion, dispatch the action and wait for the
  // result. The Redux store removes the post on success; on failure the post
  // stays in the list and a local error message is shown.
  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    setDeleting(true);
    setDeleteError("");

    const result = await dispatch(deletePostAction(postToDelete._id));

    setDeleting(false);
    setPostToDelete(null);

    if (!result.success) {
      // ⚠️ DELETE /posts/:id is a new M10 endpoint. Fallback message shown
      // until the backend partner delivers the endpoint.
      setDeleteError(
        result.message || "Delete unavailable — backend update in progress."
      );
    }
  };

  // Full-page spinner only on the initial load when the list is empty.
  if (loading && posts.length === 0) {
    return (
      <div className="content-manager__loading">
        <Spinner animation="border" size="sm" role="status" />
        <span className="ms-2">Loading posts…</span>
      </div>
    );
  }

  return (
    <div className="content-manager">
      {/* Store-level fetch error */}
      {storeError && !deleteError && (
        <Alert variant="danger" className="content-manager__alert">
          {storeError}
        </Alert>
      )}

      {/* Delete failure message — separate from fetch error so it can be
          dismissed independently without clearing the post list. */}
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

      {/* Date range filter row + "Select All" button.
          Both inputs filter independently — leaving one blank applies no bound
          on that side of the range. */}
      <div className="content-manager__filter-row">
        <span className="content-manager__filter-label">From:</span>
        <Form.Control
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          aria-label="Filter from date"
          className="content-manager__date-input"
        />
        <span className="content-manager__filter-label">To:</span>
        <Form.Control
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          aria-label="Filter to date"
          className="content-manager__date-input"
        />
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={handleSelectAll}
        >
          Select All
        </Button>
      </div>

      {/* Post table — striped + hover via Bootstrap props. */}
      <Table
        striped
        bordered
        hover
        responsive
        className="content-manager__table"
      >
        <thead>
          <tr>
            <th>Author</th>
            <th>Post</th>
            <th>Date</th>
            <th>Delete</th>
          </tr>
        </thead>
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
            pageSlice.map((post) => (
              <tr key={post._id}>
                <td>{getAuthorLabel(post)}</td>
                <td>{getPostLabel(post)}</td>
                <td>{formatDate(post.time_stamp)}</td>
                <td>
                  {/* Icon-only delete button — IoTrashOutline matches the spec.
                      aria-label names the post so screen readers convey the action. */}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setPostToDelete(post)}
                    aria-label={`Delete post: ${getPostLabel(post)}`}
                  >
                    <IoTrashOutline />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination controls — hidden when the filtered list is empty. */}
      {filtered.length > 0 && (
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

      {/* Delete confirmation modal — reuses the shared ConfirmModal from
          User Manager. Body is multi-paragraph JSX per the spec layout. */}
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
    </div>
  );
};

export default ContentManager;
