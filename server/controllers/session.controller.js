// controllers/session.controller.js — Session API handlers.
//
// Implements cookie-based authentication: login (create session), logout
// (destroy session), and validate (confirm the cookie maps to a live, unexpired
// session). All responses follow the project contract { status, data, message }.

import crypto from "crypto";
import bcrypt from "bcrypt";

import Session from "../schemas/Session.js";
import User from "../schemas/User.js";
import { COOKIE_NAME, SESSION_TTL, COOKIE_OPTIONS } from "../lib/session.config.js";
import { clear as clearPresence } from "../lib/presence.js";

// Small helper: never leak the password hash to the client. Mongoose docs need
// to be converted to plain objects before we strip the field.
function toSafeUser(userDoc) {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete user.password;
  return user;
}

// POST /session — Login.
// Verify credentials, create a Session, set the session_token cookie.
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Basic presence check; full validation lives in the relevant feature.
    if (!email || !password) {
      return res.status(401).json({
        status: "error",
        data: {},
        message: "Invalid email or password",
      });
    }

    // Find the user by email.
    const user = await User.findOne({ email });
    if (!user) {
      // ⚠️ Same generic message for "no user" and "bad password" so we don't
      // reveal which emails are registered.
      return res.status(401).json({
        status: "error",
        data: {},
        message: "Invalid email or password",
      });
    }

    // Compare the plain-text password against the stored bcrypt hash.
    // (Hashing on registration is owned by the User API; here we only compare.)
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({
        status: "error",
        data: {},
        message: "Invalid email or password",
      });
    }

    // Generate a unique session id — no extra packages needed.
    const session_id = crypto.randomUUID();

    // Persist the session linked to this user.
    await Session.create({
      session_id,
      session_date: new Date(),
      user: user._id,
    });

    // Set the HTTP-only cookie. The value is the session_id; the browser sends
    // it back automatically on later requests.
    res.cookie(COOKIE_NAME, session_id, COOKIE_OPTIONS);

    // Mark the user active now that they have a live session.
    user.status = true;
    await user.save();

    return res.status(200).json({
      status: "ok",
      data: { user: toSafeUser(user) },
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}

// DELETE /session — Logout.
// Delete the Session document and clear the cookie. Idempotent: still 200 even
// if no matching session exists.
export async function logout(req, res) {
  try {
    const session_id = req.cookies?.[COOKIE_NAME];

    if (session_id) {
      // Mark the session's user inactive before tearing down the session.
      const session = await Session.findOne({ session_id });
      if (session) {
        await User.updateOne({ _id: session.user }, { status: false });
        await Session.deleteOne({ session_id });
        // Drop them from real-time presence immediately (no need to wait for
        // the active window to lapse).
        clearPresence(session.user);
      }
    }

    // Clear the cookie using the same options it was set with.
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);

    return res.status(200).json({
      status: "ok",
      data: {},
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}

// GET /session/validate — Validate.
// Confirm the cookie maps to a live, unexpired session and return its user.
export async function validate(req, res) {
  try {
    const session_id = req.cookies?.[COOKIE_NAME];

    // No cookie → not authenticated.
    if (!session_id) {
      return res
        .status(401)
        .json({ status: "error", data: {}, message: "Unauthorized" });
    }

    // Look up the session and pull in the related user (minus password).
    const session = await Session.findOne({ session_id }).populate({
      path: "user",
      select: "-password",
    });

    if (!session) {
      return res
        .status(401)
        .json({ status: "error", data: {}, message: "Unauthorized" });
    }

    // Derive expiration from session_date + TTL (no stored expiry field).
    const expiresAt = session.session_date.getTime() + SESSION_TTL;
    if (Date.now() > expiresAt) {
      // Expired: this is an implicit logout. Mark the user inactive, then clean
      // up the stale session and cookie before rejecting.
      await User.updateOne({ _id: session.user._id }, { status: false });
      await Session.deleteOne({ session_id });
      res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
      return res
        .status(401)
        .json({ status: "error", data: {}, message: "Unauthorized" });
    }

    return res.status(200).json({
      status: "ok",
      data: { user: session.user },
      message: "Session is valid",
    });
  } catch (err) {
    console.error("Validate error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}
