import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { FaRegCheckSquare } from "react-icons/fa";
import ConfirmModal from "../components/ConfirmModal";
import SkeletonField from "../components/SkeletonField";
import { updateUserAction } from "../redux/actions/userActions";
import { getUserById } from "../services/userService";

const EditUserPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const storeUser = useSelector((state) =>
    state.users.users.find((u) => u._id === id)
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
  });

  const [loadingUser, setLoadingUser] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

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
    // storeUser is intentionally excluded — re-seeding the form when the Redux
    // store changes mid-edit (e.g., another tab) would discard the admin's work.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const firstNameInvalid = touched.firstName && firstName.trim() === "";
  const lastNameInvalid = touched.lastName && lastName.trim() === "";
  const emailInvalid = touched.email && email.trim() === "";

  const passwordMismatch =
    (newPassword !== "" || confirmPassword !== "") &&
    newPassword !== confirmPassword;

  const isValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    !passwordMismatch;

  const handleSaveClick = () => {
    setTouched({ firstName: true, lastName: true, email: true });
    if (!isValid) return;
    setUpdateError("");
    setShowModal(true);
  };

  const handleConfirmUpdate = async () => {
    // Never send password: "" — omitting it signals "no change" to the backend.
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
      navigate("/admin/users");
    } else {
      setUpdateError(
        result.message ||
          "Update unavailable — backend update in progress. Please try again later."
      );
    }
  };

  const displayName = storeUser
    ? `${storeUser.first_name} ${storeUser.last_name}`
    : `${firstName} ${lastName}`.trim();

  return (
    <Container className="edit-user-page">
      <Row>
        <Col md={6}>
          <Link to="/admin/users" className="edit-user-page__back-link">
            ← Return to User Manager
          </Link>

          <h4 className="edit-user-page__heading">Edit User</h4>

          {fetchError && (
            <Alert variant="danger">{fetchError}</Alert>
          )}

          {updateError && (
            <Alert variant="warning">
              ⚠ Update unavailable — backend update in progress. Please try again later.
            </Alert>
          )}

          <Form noValidate>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              {loadingUser ? <SkeletonField /> : (
                <>
                  <Form.Control
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
                    isInvalid={firstNameInvalid}
                  />
                  <Form.Control.Feedback type="invalid">INVALID</Form.Control.Feedback>
                </>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              {loadingUser ? <SkeletonField /> : (
                <>
                  <Form.Control
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
                    isInvalid={lastNameInvalid}
                  />
                  <Form.Control.Feedback type="invalid">INVALID</Form.Control.Feedback>
                </>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              {loadingUser ? <SkeletonField /> : (
                <>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    isInvalid={emailInvalid}
                  />
                  <Form.Control.Feedback type="invalid">INVALID</Form.Control.Feedback>
                </>
              )}
            </Form.Group>

            {!loadingUser && (
              <>
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
              </>
            )}

            <div className="d-flex justify-content-end">
              <Button
                variant="primary"
                disabled={loadingUser || !isValid}
                onClick={handleSaveClick}
              >
                <FaRegCheckSquare className="me-1" /> Save Changes
              </Button>
            </div>
          </Form>
        </Col>
      </Row>

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
