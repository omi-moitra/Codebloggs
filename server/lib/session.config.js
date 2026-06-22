// lib/session.config.js — Shared session constants.
//
// Imported by session.controller.js and middleware/requireSession.js so the
// cookie name, TTL, and options are defined in exactly one place.

export const COOKIE_NAME = "session_token";

// 24 hours in milliseconds — expiry is derived at runtime (no stored expiry field).
export const SESSION_TTL = 24 * 60 * 60 * 1000;

// ⚠️ httpOnly keeps the cookie out of document.cookie (XSS protection).
// secure is intentionally NOT set: local dev runs over HTTP.
export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
};
