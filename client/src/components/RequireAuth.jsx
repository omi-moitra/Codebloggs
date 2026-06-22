import { Navigate, Outlet, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";

const RequireAuth = ({ requireAdmin = false, redirectTo = "/login" }) => {
  const { isAuthenticated, isChecking, user } = useAuth();
  const location = useLocation();

  if (isChecking) {
    return (
      <div className="public-page">
        <div className="auth-status" role="status">
          Validating session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location }}
      />
    );
  }

  if (requireAdmin && user?.auth_level !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

RequireAuth.propTypes = {
  requireAdmin: PropTypes.bool,
  redirectTo: PropTypes.string,
};

export default RequireAuth;
