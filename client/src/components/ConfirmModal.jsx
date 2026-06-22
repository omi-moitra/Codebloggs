// =============================================================================
// components/ConfirmModal.jsx — Reusable confirmation dialog
// -----------------------------------------------------------------------------
// 1. Props       show, title, body, onCancel, onConfirm, confirmLabel,
//                confirmVariant, loading
// 2. Layout      <Modal centered> with Header (closeButton), Body, Footer
// 3. Usage       User Manager (delete user); reused by Content Manager (delete post)
// =============================================================================

import PropTypes from "prop-types";
import { Button, Modal } from "react-bootstrap";

// ConfirmModal is intentionally generic so both the User Manager and the
// Content Manager can share it without duplicating modal markup.
const ConfirmModal = ({
  show,
  title,
  body,
  onCancel,
  onConfirm,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  loading = false,
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{body}</Modal.Body>

      <Modal.Footer>
        {/* Cancel never triggers the action — it just closes the modal. */}
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>

        {/* ⚠️ The confirm button is disabled while the delete request is in
            flight to prevent double-submission. */}
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
          {loading ? "Deleting…" : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  confirmLabel: PropTypes.string,
  confirmVariant: PropTypes.string,
  loading: PropTypes.bool,
};

export default ConfirmModal;
