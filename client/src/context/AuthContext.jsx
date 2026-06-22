import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  clearSessionToken,
  loginUser,
  logoutUser,
  validateSession,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");

  const checkSession = useCallback(async () => {
    setStatus("checking");
    setError("");

    try {
      const result = await validateSession();
      setUser(result.user);
      setStatus("authenticated");
      return true;
    } catch (sessionError) {
      clearSessionToken();
      setUser(null);
      setStatus("unauthenticated");
      setError(sessionError.message);
      return false;
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    // The session cookie is httpOnly, so JS can't read it or detect its
    // deletion locally — the only signal is the server. Re-validate when the
    // user returns to the tab, silently (no "checking" spinner) so a valid
    // session causes no flicker; only flip to unauthenticated on failure.
    const revalidate = async () => {
      try {
        const result = await validateSession();
        setUser(result.user);
        setStatus("authenticated");
      } catch {
        clearSessionToken();
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    const handleFocus = () => {
      revalidate();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        revalidate();
      }
    };

    // A 401 from any API call means the session is gone — drop auth state so
    // the route guard redirects to login on the next render.
    const handleSessionExpired = () => {
      clearSessionToken();
      setUser(null);
      setStatus("unauthenticated");
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("codebloggs:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("codebloggs:session-expired", handleSessionExpired);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setStatus("checking");
    setError("");

    try {
      const result = await loginUser(credentials);
      setUser(result.user);
      setStatus("authenticated");
      return result;
    } catch (loginError) {
      clearSessionToken();
      setUser(null);
      setStatus("unauthenticated");
      setError(loginError.message);
      throw loginError;
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({
      error,
      isAuthenticated: status === "authenticated",
      isChecking: status === "checking",
      login,
      logout,
      refreshSession: checkSession,
      status,
      user,
    }),
    [checkSession, error, login, logout, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
