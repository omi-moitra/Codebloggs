// =============================================================================
// components/EditUserModal.jsx — Edit User modal (stub)
// -----------------------------------------------------------------------------
// 1. Interface     user (object | null), onClose (callback)
// 2. Stub body     placeholder until user-update.feature.md is implemented
// 3. Cancel        "Return to User Manager" closes without side effects
// =============================================================================

import PropTypes from "prop-types";
import { Button, Modal } from "react-bootstrap";

// Stub rendered by UserManager when the admin clicks Edit on a row.
// Replace the Modal.Body content when implementing user-update.feature.md.
const EditUserModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <Modal show centered onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Editing{" "}
          <strong>
            {user.first_name} {user.last_name}
          </strong>
          .
        </p>
        <p className="text-muted mb-0">
          Full edit form — implemented in <code>user-update.feature.md</code>.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Return to User Manager
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

EditUserModal.propTypes = {
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default EditUserModal;
