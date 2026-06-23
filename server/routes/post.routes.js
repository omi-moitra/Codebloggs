// post.routes.js — Post resource router (mounted at /posts in server.js).
//
// Maps each HTTP method + path to its controller handler. No business logic
// lives here — that belongs to the controller.

import express from "express";

import {
  createPost,
  updatePost,
  getAllPosts,
  deletePost,
} from "../controllers/post.controller.js";
import { requireSession } from "../middleware/requireSession.js";

const router = express.Router();

// POST  /posts      → create a new post (session required — user_id from cookie)
router.post("/", requireSession, createPost);

// GET   /posts      → get all posts
router.get("/", getAllPosts);

// PATCH /posts/:id  → update a post by id (primarily likes)
router.patch("/:id", updatePost);

// DELETE /posts/:id → delete a post and related comments/replies
router.delete("/:id", deletePost);

export default router;
