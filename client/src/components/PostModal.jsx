import { useEffect, useRef, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import PropTypes from "prop-types";
import AutoDismissAlert from "./AutoDismissAlert";
import { createPost } from "../services/postService";

const PostModal = ({ isOpen, onClose, onCreated }) => {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setStatus("idle");
    setError("");
    window.setTimeout(() => textAreaRef.current?.focus(), 0);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (status !== "submitting") {
      onClose();
    }
  };

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("Write something before publishing your post.");
      return;
    }

    setStatus("submitting");
    setError("");

    try {
      const result = await createPost({
        content: trimmedContent,
      });

      setContent("");
      setStatus("idle");
      onCreated(result);
      onClose();
    } catch (postError) {
      setStatus("idle");
      setError(postError.message || "Unable to create your post. Please try again.");
    }
  };

  return (
    <div
      aria-labelledby="post-modal-title"
      aria-modal="true"
      className="post-modal"
      onMouseDown={handleOverlayMouseDown}
      role="dialog"
    >
      <div className="post-modal__dialog">
        <div className="post-modal__header">
          <div>
            <h2 id="post-modal-title">Create post</h2>
            <p>Share an update with CodeBloggs.</p>
          </div>
          <Button
            aria-label="Close post modal"
            className="post-modal__close"
            disabled={status === "submitting"}
            onClick={handleClose}
            type="button"
            variant="link"
          >
            x
          </Button>
        </div>

        {error ? (
          <AutoDismissAlert
            className="post-modal__alert"
            onClose={() => setError("")}
            variant="danger"
          >
            {error}
          </AutoDismissAlert>
        ) : null}

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="postContent">
            <Form.Label>Post content</Form.Label>
            <Form.Control
              as="textarea"
              className="post-modal__textarea"
              disabled={status === "submitting"}
              onChange={(event) => {
                setContent(event.target.value);
                if (error) {
                  setError("");
                }
              }}
              placeholder="What's on your mind?"
              ref={textAreaRef}
              rows={6}
              value={content}
            />
          </Form.Group>

          <div className="post-modal__actions">
            <Button
              disabled={status === "submitting"}
              onClick={handleClose}
              type="button"
              variant="outline-secondary"
            >
              Cancel
            </Button>
            <Button
              disabled={status === "submitting" || !content.trim()}
              type="submit"
              variant="primary"
            >
              {status === "submitting" ? (
                <>
                  <Spinner animation="border" size="sm" />
                  <span>Posting...</span>
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

PostModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired,
};

export default PostModal;
