import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Form, Row, Col } from "react-bootstrap";
import AutoDismissAlert from "../components/AutoDismissAlert";
import LocationAutocomplete from "../components/LocationAutocomplete";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/authService";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    birthday: "",
    email: "",
    password: "",
    location: "",
    occupation: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!EMAIL_REGEX.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await registerUser(formData);
      navigate("/login", {
        replace: true,
        state: { message: result.message },
      });
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="public-page">
      <Card className="auth-card auth-card--wide">
        <Card.Body>
          <Card.Title as="h1">Register</Card.Title>
          {error ? (
            <AutoDismissAlert onClose={() => setError("")} variant="danger">
              {error}
            </AutoDismissAlert>
          ) : null}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="register-first-name">
                  <Form.Label>First name</Form.Label>
                  <Form.Control
                    autoComplete="given-name"
                    maxLength={50}
                    name="first_name"
                    onChange={handleChange}
                    required
                    value={formData.first_name}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="register-last-name">
                  <Form.Label>Last name</Form.Label>
                  <Form.Control
                    autoComplete="family-name"
                    maxLength={50}
                    name="last_name"
                    onChange={handleChange}
                    required
                    value={formData.last_name}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="register-birthday">
              <Form.Label>Birthday</Form.Label>
              <Form.Control
                name="birthday"
                onChange={handleChange}
                required
                type="date"
                value={formData.birthday}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="register-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                autoComplete="email"
                name="email"
                onChange={handleChange}
                onInvalid={(event) => {
                  event.preventDefault();
                  setError("Please enter a valid email address.");
                }}
                required
                type="email"
                value={formData.email}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="register-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                autoComplete="new-password"
                minLength={8}
                name="password"
                onChange={handleChange}
                required
                type="password"
                value={formData.password}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="register-location">
                  <Form.Label>Location</Form.Label>
                  <LocationAutocomplete
                    maxLength={100}
                    onChange={(val) =>
                      setFormData((cur) => ({
                        ...cur,
                        location: val,
                      }))
                    }
                    required
                    value={formData.location}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4" controlId="register-occupation">
                  <Form.Label>Occupation</Form.Label>
                  <Form.Control
                    autoComplete="organization-title"
                    maxLength={100}
                    name="occupation"
                    onChange={handleChange}
                    required
                    value={formData.occupation}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button
              className="w-100"
              disabled={isSubmitting}
              type="submit"
              variant="primary"
            >
              {isSubmitting ? "Creating account..." : "Register"}
            </Button>
          </Form>
          <p className="auth-card__footer">
            <Link to="/login">Already a member? Login</Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;
