import { getCookie, removeCookie, setCookie } from "react-use-cookie";
import { request } from "./apiClient";

const SESSION_COOKIE = "session_token";

const getResponseToken = (payload) =>
  payload?.data?.session_token ||
  payload?.data?.sessionToken ||
  payload?.data?.token ||
  payload?.session_token ||
  payload?.sessionToken ||
  payload?.token ||
  "";

const getResponseUser = (payload) => payload?.data?.user || payload?.user || null;

const normalizeEmailForSubmission = (email) => email.trim().toLowerCase();

export const readSessionToken = () => getCookie(SESSION_COOKIE);

export const writeSessionToken = (token) => {
  if (!token) {
    return;
  }

  setCookie(SESSION_COOKIE, token, {
    days: 1,
    path: "/",
    SameSite: "Lax",
  });
};

export const clearSessionToken = () => {
  removeCookie(SESSION_COOKIE);
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmailForSubmission(email);
  const payload = await request("/session", {
    method: "POST",
    body: JSON.stringify({ email: normalizedEmail, password }),
  });
  const token = getResponseToken(payload);

  if (token) {
    writeSessionToken(token);
  }

  return {
    token: token || readSessionToken(),
    user: getResponseUser(payload),
    message: payload?.message || "Login successful.",
  };
};

export const registerUser = async (formData) => {
  const payload = await request("/user", {
    method: "POST",
    body: JSON.stringify({
      ...formData,
      email: normalizeEmailForSubmission(formData.email),
      auth_level: "basic",
    }),
  });

  return {
    user: getResponseUser(payload),
    message: payload?.message || "Registration successful. Please log in.",
  };
};

export const validateSession = async () => {
  const payload = await request("/session/validate");

  return {
    user: getResponseUser(payload),
    message: payload?.message || "Session is valid.",
  };
};

export const logoutUser = async () => {
  try {
    await request("/session", { method: "DELETE" });
  } finally {
    clearSessionToken();
  }
};
