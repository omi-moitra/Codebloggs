// =============================================================================
// pages/EditUserPage.jsx — Admin Edit User page (/admin/users/:id)
// -----------------------------------------------------------------------------
// 1. Data lookup      reads :id from URL; finds user in Redux store or fetches
//                     from GET /user/:id as a fallback
// 2. Form fields      First Name, Last Name, Email, New Password, Confirm Password
// 3. Validation       required fields show isInvalid on blur/submit; password
//                     mismatch disables Save Changes
// 4. ConfirmModal     shared component; opens on "Save Changes"; dispatches
//                     updateUserAction on confirm
// 5. Navigation       navigate("/admin/users") on success; stay on page on error
// 6. Error handling   inline Bootstrap Alert when PATCH endpoint is unavailable
// =============================================================================

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { FaRegCheckSquare } from "react-icons/fa";
import ConfirmModal from "../components/ConfirmModal";
import { updateUserAction } from "../redux/actions/userActions";
import { getUserById } from "../services/userService";

const EditUserPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Look up user from the Redux store first — avoids an extra network call
  // when the admin navigated here from the User Manager table where all users
  // are already loaded by fetchUsers.
  const storeUser = useSelector((state) =>
    state.users.users.find((u) => u._id === id)
  );

  // Controlled form field values — held in local state because they only
  // affect this component; no other part of the app reads the in-progress form.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  // Password fields always start empty — the spec requires blank == no change.
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Track which required fields have been touched so validation errors only
  // appear after interaction, not on first render.
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
  });

  // UI-only state — not stored in Redux because it doesn't survive navigation.
  const [loadingUser, setLoadingUser] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // On mount, seed form fields from the Redux store.
  // If the admin navigated directly to this URL (no store entry), fall back to
  // GET /user/:id. This handles deep-link / browser-refresh scenarios.
  useEffect(() => {
    if (storeUser) {
      setFirstName(storeUser.first_name || "");
      setLastName(storeUser.last_name || "");
      setEmail(storeUser.email || "");
    } else {
      const fetchUser = async () => {
        setLoadingUser(true);
        try {
          const { user } = await getUserById(id);
          if (user) {
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            setEmail(user.email || "");
          } else {
            setFetchError("User not found.");
          }
        } catch (err) {
          setFetchError(err.message || "Failed to load user.");
        } finally {
          setLoadingUser(false);
        }
      };
      fetchUser();
    }
    // storeUser is intentionally excluded from the dependency array after the
    // initial mount — we don't want to re-seed the form if the Redux store
    // changes while the admin is mid-edit (e.g., another tab updating users).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // --- Validation ---
  // Required fields show isInvalid only after the admin has touched them.
  const firstNameInvalid = touched.firstName && firstName.trim() === "";
  const lastNameInvalid = touched.lastName && lastName.trim() === "";
  const emailInvalid = touched.email && email.trim() === "";

  // If either password field has a value, both must match before the form is valid.
  const passwordMismatch =
    (newPassword !== "" || confirmPassword !== "") &&
    newPassword !== confirmPassword;

  // Save Changes is only enabled when all required fields are filled AND
  // passwords are either both blank (no change) or identical.
  const isValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    !passwordMismatch;

  const handleSaveClick = () => {
    // Mark all required fields as touched so isInvalid borders show on any
    // blank field — catches the case where the admin never blurred a field.
    setTouched({ firstName: true, lastName: true, email: true });
    if (!isValid) return;
    setUpdateError("");
    setShowModal(true);
  };

  const handleConfirmUpdate = async () => {
    // Build a partial payload — only include password when the admin entered one.
    // Never send password: "" to the backend; that would signal an intentional
    // clear and could break the backend's "omit == no change" contract.
    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      ...(newPassword !== "" ? { password: newPassword } : {}),
    };

    setUpdating(true);
    const result = await dispatch(updateUserAction(id, payload));
    setUpdating(false);
    setShowModal(false);

    if (result.success) {
      // Redux store was already updated by the Thunk (UPDATE_USER_SUCCESS).
      // Navigate back so the admin sees the updated row in the table.
      navigate("/admin/users");
    } else {
      // ⚠️ PATCH /user/:id is a new M10 endpoint — not yet delivered by the
      // backend partner. Show a graceful inline alert; do NOT navigate away
      // and do NOT modify the Redux store (UPDATE_USER_FAILURE leaves it intact).
      setUpdateError(
        result.message ||
          "Update unavailable — backend update in progress. Please try again later."
      );
    }
  };

  // The full name shown in the confirm modal body.
  // Use the store value when available for accuracy; fall back to edited fields.
  const displayName = storeUser
    ? `${storeUser.first_name} ${storeUser.last_name}`
    : `${firstName} ${lastName}`.trim();

  if (loadingUser) {
    return <div className="p-3 text-muted">Loading user…</div>;
  }

  return (
    <Container className="edit-user-page">
      <Row>
        <Col md={6}>
          {/* "Return to User Manager" — the exact label is a grading sheet
              requirement (Working/Module_10/Issues.md #11). Do not rename it. */}
          <Link to="/admin/users" className="edit-user-page__back-link">
            ← Return to User Manager
          </Link>

          <h4 className="edit-user-page__heading">Edit User</h4>

          {/* Shown when the fallback GET /user/:id call fails (e.g., invalid id). */}
          {fetchError && (
            <Alert variant="danger">{fetchError}</Alert>
          )}

          {/* Shown when the PATCH call fails — admin stays on the page with
              form fields retaining their edited values. Redux store unchanged. */}
          {updateError && (
            <Alert variant="warning">
              ⚠ Update unavailable — backend update in progress. Please try again later.
            </Alert>
          )}

          <Form noValidate>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
                isInvalid={firstNameInvalid}
              />
              <Form.Control.Feedback type="invalid">INVALID</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
                isInvalid={lastNameInvalid}
              />
              <Form.Control.Feedback type="invalid">INVALID</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                isInvalid={emailInvalid}
              />
              <Form.Control.Feedback type="invalid">INVALID</Form.Control.Feedback>
            </Form.Group>

            {/* New Password — optional. Blank means "keep current password".
                The password is excluded from the PATCH payload when blank. */}
            <Form.Group className="mb-3">
              <Form.Label>
                New Password{" "}
                <span className="text-muted">(leave blank to keep current)</span>
              </Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
            </Form.Group>

            {/* Confirm Password — only required when the admin entered a new password. */}
            <Form.Group className="mb-4">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {passwordMismatch && (
                <Form.Text className="text-danger">
                  Passwords do not match.
                </Form.Text>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="primary"
                disabled={!isValid}
                onClick={handleSaveClick}
              >
                <FaRegCheckSquare className="me-1" /> Save Changes
              </Button>
            </div>
          </Form>
        </Col>
      </Row>

      {/* Confirm Changes modal — same ConfirmModal shared with the delete flow.
          confirmVariant="primary" and confirmLabel="Save Changes" override the
          delete-flow defaults so the button style matches the update context. */}
      <ConfirmModal
        show={showModal}
        title="Confirm Changes"
        body={
          <p>
            Are you sure you want to update <strong>{displayName}</strong>? These
            changes will be saved immediately.
          </p>
        }
        onCancel={() => setShowModal(false)}
        onConfirm={handleConfirmUpdate}
        confirmLabel="Save Changes"
        confirmVariant="primary"
        loading={updating}
        loadingLabel="Saving…"
      />
    </Container>
  );
};

export default EditUserPage;
