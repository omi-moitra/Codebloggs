import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Form } from "react-bootstrap";
import AutoDismissAlert from "../components/AutoDismissAlert";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isChecking, login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    try {
      await login(formData);
      navigate("/home", { replace: true });
    } catch (loginError) {
      setError(
        loginError?.message ||
          "Login failed. Please check your credentials and make sure the backend is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="public-page">
      <Card className="auth-card">
        <Card.Body>
          <Card.Title as="h1">Login</Card.Title>
          {location.state?.message ? (
            <AutoDismissAlert variant="success">
              {location.state.message}
            </AutoDismissAlert>
          ) : null}
          {error ? (
            <AutoDismissAlert onClose={() => setError("")} variant="danger">
              {error}
            </AutoDismissAlert>
          ) : null}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="login-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                autoComplete="email"
                name="email"
                onChange={handleChange}
                required
                type="email"
                value={formData.email}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="login-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                autoComplete="current-password"
                name="password"
                onChange={handleChange}
                required
                type="password"
                value={formData.password}
              />
            </Form.Group>

            <Button
              className="w-100"
              disabled={isSubmitting || isChecking}
              type="submit"
              variant="primary"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </Form>
          <p className="auth-card__footer">
            <Link to="/register">Not a member? Register now</Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
