// presence.routes.js — Presence resource router (mounted at /presence).
//
// Exposes the list of users who are currently online. Guarded by requireSession
// so only authenticated callers can read presence — and so each poll refreshes
// the caller's own presence (the heartbeat).

import express from "express";

import { getPresence } from "../controllers/presence.controller.js";
import { requireSession } from "../middleware/requireSession.js";

const router = express.Router();

// GET /presence → user ids active (online) right now
router.get("/", requireSession, getPresence);

export default router;
