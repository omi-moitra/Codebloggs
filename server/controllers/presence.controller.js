// controllers/presence.controller.js — Real-time presence API handler.
//
// Returns the set of users currently online. Presence is tracked in memory
// (lib/presence.js) and refreshed by requireSession on every authenticated
// request — so serving this endpoint also marks the caller active, which makes
// the client's polling double as a heartbeat. Response follows the project
// contract { status, data, message }.

import { getActiveUserIds } from "../lib/presence.js";

// GET /presence — list the user ids currently active (online now).
export async function getPresence(req, res) {
  try {
    return res.status(200).json({
      status: "ok",
      data: { activeUserIds: getActiveUserIds() },
      message: "Presence retrieved successfully",
    });
  } catch (err) {
    console.error("Get presence error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}
