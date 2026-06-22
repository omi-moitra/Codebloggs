// schemas/Session.js — Session Mongoose model (collection: "sessions").
//
// Cookie-based session record. Shape only:
// ⚠️ session-id generation and expiry CHECKING are owned by the Session API
// feature. Expiration is derived from `session_date` there — there is no stored
// `expiry` field by design (see Working/Issues.md).
//
// `_id` is the default Mongo-generated ObjectId.

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  // The session identifier stored in the cookie — the value the browser sends
  // back on each request.
  session_id: { type: String, required: true },

  // When the session was created; expiration is derived from this in the API.
  session_date: { type: Date, default: Date.now },

  // The authenticated user this session belongs to.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Session = mongoose.model("Session", sessionSchema);

export default Session;
