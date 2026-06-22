// comment.routes.js — Comment resource router (mounted at /comments in server.js).
//
// Maps each HTTP method + path to its controller handler. No business logic
// lives here — that belongs to the controller.

import express from "express";

import {
  createComment,
  updateComment,
  getAllComments,
} from "../controllers/comment.controller.js";
import { requireSession } from "../middleware/requireSession.js";

const router = express.Router();

// POST /comments      → create a new comment (session required — user_id from cookie)
router.post("/", requireSession, createComment);

// GET  /comments      → get all comments
router.get("/", getAllComments);

// PATCH /comments/:id  → update a comment by id (content and/or likes)
router.patch("/:id", updateComment);

export default router;
