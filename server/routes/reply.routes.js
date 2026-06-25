// reply.routes.js — Reply resource router (mounted at /replies in server.js).
//
// Maps each HTTP method + path to its controller handler. No business logic
// lives here — that belongs to the controller.

import express from "express";

import {
  createReply,
  deleteReply,
  updateReply,
  getRepliesByPost,
} from "../controllers/reply.controller.js";
import { requireSession } from "../middleware/requireSession.js";

const router = express.Router();

// POST /replies      → create a new reply (session required — user_id from cookie)
router.post("/", requireSession, createReply);

// GET  /replies?post_id=<id>  → get all replies for a post
router.get("/", getRepliesByPost);

// PUT  /replies/:id  → increment/decrement like count
router.put("/:id", updateReply);

// DELETE /replies/:id  → admin deletes a reply and related child replies
router.delete("/:id", requireSession, deleteReply);

export default router;
