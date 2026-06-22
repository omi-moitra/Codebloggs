import { useEffect, useState } from "react";
import { Button, Card, Form, Spinner } from "react-bootstrap";
import AutoDismissAlert from "../components/AutoDismissAlert";
import ProfileAvatar from "../components/ProfileAvatar";
import { useAuth } from "../context/AuthContext";
import { publishProfilePicUpdate, uploadProfilePic } from "../services/profilePicService";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const AccountSettings = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setFeedback(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setFile(null);
      event.target.value = "";
      setFeedback({
        message: "Only JPEG and PNG profile pictures are accepted.",
        variant: "danger",
      });
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      event.target.value = "";
      setFeedback({
        message: "Profile pictures must be 2 MB or smaller.",
        variant: "danger",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setFeedback({
        message: "Choose a JPEG or PNG image before uploading.",
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const result = await uploadProfilePic(file);
      publishProfilePicUpdate(user?._id);
      setFile(null);
      setFeedback({
        message: result.message,
        variant: "success",
      });
    } catch (uploadError) {
      setFeedback({
        message: uploadError.message || "Unable to upload profile picture.",
        variant: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="settings-page">
      <div className="settings-page__header">
        <h1>Account Settings</h1>
        <p>Profile picture uploads are stored separately from your account record.</p>
      </div>

      <Card className="settings-card">
        <Card.Body>
          <div className="settings-card__preview">
            <ProfileAvatar
              className="settings-card__avatar"
              previewUrl={previewUrl}
              user={user}
            />
            <div>
              <h2>Profile Picture</h2>
              <p>Upload a JPEG or PNG image up to 2 MB.</p>
            </div>
          </div>

          {feedback ? (
            <AutoDismissAlert
              className="settings-card__alert"
              onClose={() => setFeedback(null)}
              variant={feedback.variant}
            >
              {feedback.message}
            </AutoDismissAlert>
          ) : null}

          <Form className="settings-card__form" onSubmit={handleSubmit}>
            <Form.Group controlId="profilePicture">
              <Form.Label>Image file</Form.Label>
              <Form.Control
                accept="image/jpeg,image/png"
                disabled={isSubmitting}
                onChange={handleFileChange}
                type="file"
              />
            </Form.Group>

            <Button disabled={isSubmitting || !file} type="submit" variant="primary">
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" />
                  Uploading...
                </>
              ) : (
                "Upload Profile Picture"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </section>
  );
};

export default AccountSettings;
