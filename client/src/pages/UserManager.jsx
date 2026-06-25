import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Form, Table } from "react-bootstrap";
import { BsCaretUpFill, BsFillCaretDownFill } from "react-icons/bs";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import { TbCaretUpDownFilled } from "react-icons/tb";
import { fetchUsers, deleteUserAction } from "../redux/actions/userActions";
import ConfirmModal from "../components/ConfirmModal";
import SkeletonTable from "../components/SkeletonTable";

const PAGE_SIZE_OPTIONS = [10, 15, 20];

const UserManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users, loading, error: storeError } = useSelector((state) => state.users);

  const [firstNameSearch, setFirstNameSearch] = useState("");
  const [lastNameSearch, setLastNameSearch] = useState("");
  const [sortField, setSortField] = useState("first_name");
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [locationFilter, setLocationFilter] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const fn = firstNameSearch.toLowerCase().trim();
    const ln = lastNameSearch.toLowerCase().trim();
    if (!fn && !ln && !locationFilter) return users;
    return users.filter(
      (u) =>
        (!fn || u.first_name?.toLowerCase().includes(fn)) &&
        (!ln || u.last_name?.toLowerCase().includes(ln)) &&
        (!locationFilter || u.location === locationFilter)
    );
  }, [users, firstNameSearch, lastNameSearch, locationFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = (a[sortField] || "").toLowerCase();
      const bVal = (b[sortField] || "").toLowerCase();
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  const locationOptions = useMemo(() => {
    const unique = [...new Set(users.map((u) => u.location).filter(Boolean))].sort();
    return unique;
  }, [users]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const pageSlice = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleFirstNameSearch = (e) => {
    setFirstNameSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleLastNameSearch = (e) => {
    setLastNameSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFirstNameSearch("");
    setLastNameSearch("");
    setLocationFilter("");
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    setDeleteError("");

    const result = await dispatch(deleteUserAction(userToDelete._id));

    setDeleting(false);
    setUserToDelete(null);

    if (!result.success) {
      setDeleteError(
        result.message || "Delete unavailable — backend update in progress."
      );
    }
  };

  const sortIndicator = (field) => {
    if (sortField !== field) return <TbCaretUpDownFilled className="user-manager__sort-icon user-manager__sort-icon--inactive" />;
    return sortDir === "asc"
      ? <BsCaretUpFill className="user-manager__sort-icon" />
      : <BsFillCaretDownFill className="user-manager__sort-icon" />;
  };

  return (
    <div className="user-manager">
      {storeError && !deleteError && (
        <Alert variant="danger" className="user-manager__alert">
          {storeError}
        </Alert>
      )}

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

      <div className="user-manager__search-row">
        <Form.Control
          type="text"
          placeholder="First Name…"
          value={firstNameSearch}
          onChange={handleFirstNameSearch}
          aria-label="Filter by first name"
          className="user-manager__search-field"
          disabled={loading}
        />
        <Form.Control
          type="text"
          placeholder="Last Name…"
          value={lastNameSearch}
          onChange={handleLastNameSearch}
          aria-label="Filter by last name"
          className="user-manager__search-field"
          disabled={loading}
        />
        <Form.Select
          value={locationFilter}
          onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
          aria-label="Filter by location"
          disabled={loading}
          className="user-manager__search-field"
        >
          <option value="">All Locations</option>
          {locationOptions.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </Form.Select>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={handleClear}
          disabled={loading || (!firstNameSearch && !lastNameSearch && !locationFilter)}
        >
          Clear
        </Button>
      </div>

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
            <th>Location</th>
            <th />
          </tr>
        </thead>
        {loading ? (
          <SkeletonTable rows={pageSize} cols={4} />
        ) : (
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
                  <td>{user.location || "—"}</td>
                  <td className="user-manager__actions-cell">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/admin/users/${user._id}`)}
                      aria-label={`Edit ${user.first_name} ${user.last_name}`}
                    >
                      <FaRegEdit />
                    </Button>
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
        )}
      </Table>

      {sorted.length > 0 && !loading && (
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
              <p>This will permanently delete:</p>
              <ul className="mb-2">
                <li>Their account</li>
                <li>All posts they created</li>
                <li>All comments on those posts</li>
                <li>All comments they left on other posts</li>
              </ul>
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
