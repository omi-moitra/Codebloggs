// =============================================================================
// pages/UserManager.jsx — Admin User Manager table
// -----------------------------------------------------------------------------
// 1. Data fetching      dispatch fetchUsers() on mount via Redux Thunk
// 2. Search             two fields (firstNameSearch / lastNameSearch); AND filter; Clear button
// 3. Sort               client-side sort by column header click (asc / desc)
// 4. Pagination         slice sorted results; previous/next controls
// 5. Results-per-page   dropdown: 10, 15, 20; resets to page 1 on change
// 6. Delete flow        Delete button (IoTrashOutline) → ConfirmModal → dispatch deleteUserAction
// 7. Edit flow          Edit button (FaRegEdit) → navigate to /admin/users/:id (EditUserPage)
// 8. Icons              FaRegEdit (edit), IoTrashOutline (delete) from react-icons
// =============================================================================

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Form, Spinner, Table } from "react-bootstrap";
import { BsCaretUpFill, BsFillCaretDownFill } from "react-icons/bs";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import { TbCaretUpDownFilled } from "react-icons/tb";
import { fetchUsers, deleteUserAction } from "../redux/actions/userActions";
import ConfirmModal from "../components/ConfirmModal";

const PAGE_SIZE_OPTIONS = [10, 15, 20];

const UserManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Pull user list and async state from the Redux store.
  const { users, loading, error: storeError } = useSelector((state) => state.users);

  // Local UI state — none of this belongs in Redux because it only affects
  // this component and does not need to survive navigation.
  const [firstNameSearch, setFirstNameSearch] = useState("");
  const [lastNameSearch, setLastNameSearch] = useState("");
  const [sortField, setSortField] = useState("first_name");
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Fetch the full user list once when the component mounts. The thunk
  // updates the Redux store; re-renders happen via useSelector.
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // --- Client-side filter ---
  // Filter by first name AND last name independently. An empty field skips
  // that dimension so partial searches work as expected.
  const filtered = useMemo(() => {
    const fn = firstNameSearch.toLowerCase().trim();
    const ln = lastNameSearch.toLowerCase().trim();
    if (!fn && !ln) return users;
    return users.filter(
      (u) =>
        (!fn || u.first_name?.toLowerCase().includes(fn)) &&
        (!ln || u.last_name?.toLowerCase().includes(ln))
    );
  }, [users, firstNameSearch, lastNameSearch]);

  // --- Client-side sort ---
  // Sort the filtered list by the active column. Spread into a new array so
  // the original Redux array is not mutated.
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = (a[sortField] || "").toLowerCase();
      const bVal = (b[sortField] || "").toLowerCase();
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  // --- Pagination math ---
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  // Clamp page so it never exceeds totalPages after a search narrows results.
  const page = Math.min(currentPage, totalPages);
  const pageSlice = sorted.slice((page - 1) * pageSize, page * pageSize);

  // Toggle sort: click the same column → flip direction; click a new column → asc.
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Reset to page 1 whenever a search field changes so the admin always
  // sees the first matching results, not a potentially empty page.
  const handleFirstNameSearch = (e) => {
    setFirstNameSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleLastNameSearch = (e) => {
    setLastNameSearch(e.target.value);
    setCurrentPage(1);
  };

  // Clear both search fields and reset to page 1 so the full unfiltered list reloads.
  const handleClear = () => {
    setFirstNameSearch("");
    setLastNameSearch("");
    setCurrentPage(1);
  };

  // Reset to page 1 on page-size change so the new size takes effect cleanly.
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  // After the admin confirms deletion, dispatch the action and wait for the
  // result. The Redux store removes the user on success; on failure the user
  // stays in the list and a local error message is shown.
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    setDeleteError("");

    const result = await dispatch(deleteUserAction(userToDelete._id));

    setDeleting(false);
    setUserToDelete(null);

    if (!result.success) {
      // ⚠️ DELETE /user/:id is a new M10 endpoint. Fallback message shown
      // until the backend partner delivers the endpoint.
      setDeleteError(
        result.message || "Delete unavailable — backend update in progress."
      );
    }
  };

  // Returns the appropriate sort icon for a column header.
  // Unsorted columns get a neutral double-caret; the active column gets the
  // directional caret that matches the current sort direction.
  const sortIndicator = (field) => {
    if (sortField !== field) return <TbCaretUpDownFilled className="user-manager__sort-icon user-manager__sort-icon--inactive" />;
    return sortDir === "asc"
      ? <BsCaretUpFill className="user-manager__sort-icon" />
      : <BsFillCaretDownFill className="user-manager__sort-icon" />;
  };

  // Full-page spinner only on the initial load when the list is empty.
  // Subsequent re-fetches happen silently.
  if (loading && users.length === 0) {
    return (
      <div className="user-manager__loading">
        <Spinner animation="border" size="sm" role="status" />
        <span className="ms-2">Loading users…</span>
      </div>
    );
  }

  return (
    <div className="user-manager">
      {/* Store-level fetch error */}
      {storeError && !deleteError && (
        <Alert variant="danger" className="user-manager__alert">
          {storeError}
        </Alert>
      )}

      {/* Delete failure message — separate from fetch error so it can be
          dismissed independently without clearing the user list. */}
      {deleteError && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setDeleteError("")}
          className="user-manager__alert"
        >
          {deleteError}
        </Alert>
      )}

      {/* Two separate search fields (First Name + Last Name) + Clear button.
          Both fields filter the list independently via AND logic on every keystroke. */}
      <div className="user-manager__search-row">
        <Form.Control
          type="text"
          placeholder="First Name…"
          value={firstNameSearch}
          onChange={handleFirstNameSearch}
          aria-label="Filter by first name"
          className="user-manager__search-field"
        />
        <Form.Control
          type="text"
          placeholder="Last Name…"
          value={lastNameSearch}
          onChange={handleLastNameSearch}
          aria-label="Filter by last name"
          className="user-manager__search-field"
        />
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={handleClear}
          disabled={!firstNameSearch && !lastNameSearch}
        >
          Clear
        </Button>
      </div>

      {/* User table — striped + hover are applied via Bootstrap props. */}
      <Table
        striped
        bordered
        hover
        responsive
        className="user-manager__table"
      >
        <thead>
          <tr>
            <th
              style={{ cursor: "pointer" }}
              onClick={() => handleSort("first_name")}
              aria-sort={sortField === "first_name" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
            >
              <span className="user-manager__col-header">
                First Name {sortIndicator("first_name")}
              </span>
            </th>
            <th
              style={{ cursor: "pointer" }}
              onClick={() => handleSort("last_name")}
              aria-sort={sortField === "last_name" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
            >
              <span className="user-manager__col-header">
                Last Name {sortIndicator("last_name")}
              </span>
            </th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {pageSlice.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center user-manager__empty">
                No users match your search.
              </td>
            </tr>
          ) : (
            pageSlice.map((user) => (
              <tr key={user._id}>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>
                  {/* Edit navigates to the full EditUserPage at /admin/users/:id.
                      The user is already in the Redux store so EditUserPage can
                      pre-populate without an extra network call. */}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate(`/admin/users/${user._id}`)}
                    aria-label={`Edit ${user.first_name} ${user.last_name}`}
                  >
                    <FaRegEdit />
                  </Button>
                </td>
                <td>
                  {/* Icon-only delete button — IoTrashOutline from Ionicons 5
                      matches the spec. The aria-label names the user so
                      screen readers still convey the action. */}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setUserToDelete(user)}
                    aria-label={`Delete ${user.first_name} ${user.last_name}`}
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
      {sorted.length > 0 && (
        <div className="user-manager__pagination">
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            &larr; Prev
          </Button>

          <span className="user-manager__page-info">
            Page {page} of {totalPages}
          </span>

          <span className="user-manager__page-label">Show:</span>

          <Form.Select
            size="sm"
            className="user-manager__page-size"
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

      {/* Delete confirmation modal — reusable component shared with Content Manager.
          Body is JSX so the user's name and the warning can sit in separate
          paragraphs, matching the two-paragraph layout in the spec. */}
      <ConfirmModal
        show={!!userToDelete}
        title="Delete User"
        body={
          userToDelete ? (
            <>
              <p>
                Are you sure you want to delete{" "}
                <strong>
                  {userToDelete.first_name} {userToDelete.last_name}
                </strong>
                ?
              </p>
              <p className="mb-0">This action cannot be undone.</p>
            </>
          ) : null
        }
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
        loadingLabel="Deleting…"
      />

    </div>
  );
};

export default UserManager;
