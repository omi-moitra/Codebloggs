// middleware/requireSession.js — Session guard for protected routes.
//
// Reads the session cookie, validates it (existence + expiry), and attaches
// the authenticated user to req.user. Aborts with 401 if the session is
// missing, unknown, or expired. Call next() only on success.
//
// Usage: router.post("/", requireSession, handler)

import Session from "../schemas/Session.js";
import { COOKIE_NAME, SESSION_TTL, COOKIE_OPTIONS } from "../lib/session.config.js";
import { touch as touchPresence } from "../lib/presence.js";

export async function requireSession(req, res, next) {
  try {
    const session_id = req.cookies?.[COOKIE_NAME];

    if (!session_id) {
      return res.status(401).json({ status: "error", data: {}, message: "Unauthorized" });
    }

    const session = await Session.findOne({ session_id }).populate({
      path: "user",
      select: "-password",
    });

    if (!session) {
      return res.status(401).json({ status: "error", data: {}, message: "Unauthorized" });
    }

    const expiresAt = session.session_date.getTime() + SESSION_TTL;
    if (Date.now() > expiresAt) {
      await Session.deleteOne({ session_id });
      res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
      return res.status(401).json({ status: "error", data: {}, message: "Unauthorized" });
    }

    // Attach the authenticated user so downstream handlers don't need to
    // repeat the session lookup — user_id is always req.user._id.
    req.user = session.user;

    // Refresh real-time presence: any authenticated request marks the user as
    // currently online (see lib/presence.js).
    touchPresence(req.user._id);

    next();
  } catch (err) {
    console.error("requireSession error:", err);
    return res.status(500).json({ status: "error", data: {}, message: "Internal server error" });
  }
}
