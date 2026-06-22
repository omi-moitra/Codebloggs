// session.routes.js — Session resource router (mounted at /session in server.js).
//
// Maps each HTTP method + path to its controller handler. No business logic
// lives here — that belongs to the controller.

import express from "express";

import { login, logout, validate } from "../controllers/session.controller.js";

const router = express.Router();

// POST   /session          → login (create session, set cookie)
router.post("/", login);

// DELETE /session          → logout (destroy session, clear cookie)
router.delete("/", logout);

// GET    /session/validate → validate the session cookie
router.get("/validate", validate);

export default router;
