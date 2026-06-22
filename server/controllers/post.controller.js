// controllers/post.controller.js — Post API handlers.
//
// Create posts, update a post (primarily its like count), and read the full
// feed. All responses follow the project contract { status, data, message }.

import Post from "../schemas/Post.js";

// POST /posts — Create a new post.
export async function createPost(req, res) {
  try {
    const { content } = req.body;

    // user_id is always taken from the validated session (set by requireSession
    // middleware) — never from the request body, so clients cannot impersonate
    // another user.
    const user_id = req.user._id;

    // time_stamp is always generated server-side so clients cannot supply
    // backdated or future-dated values. Stored as an ISO 8601 string per
    // Issues.md Issue 7.
    const time_stamp = new Date().toISOString();

    // ⚠️ likes and comments are ALWAYS set server-side on create — never read
    // from the request body. A new post starts at 0 likes with no comments.
    const post = await Post.create({
      content,
      user_id,
      time_stamp,
      likes: 0,
      comments: [],
    });

    return res.status(201).json({
      status: "ok",
      data: { post },
      message: "Post created successfully",
    });
  } catch (err) {
    // Missing/invalid required fields → 400 instead of a generic 500.
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({
        status: "error",
        data: {},
        message: "Invalid post data",
      });
    }
    console.error("Create post error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}

// PATCH /posts/:id — Update a post by ID (like count only).
export async function updatePost(req, res) {
  try {
    // Whitelist: only `likes` is patchable per the wireframe contract.
    // Passing req.body directly would allow any field — including content and
    // user_id — to be overwritten by any caller (mass assignment). Extracting
    // only the permitted field and building the update object explicitly closes
    // that vector.
    const { likes } = req.body;

    // { new: true } returns the UPDATED document; runValidators keeps schema
    // types enforced on the partial update.
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { likes } }, {
      new: true,
      runValidators: true,
    });

    if (!post) {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "Post not found",
      });
    }

    return res.status(200).json({
      status: "ok",
      data: { post },
      message: "Post updated successfully",
    });
  } catch (err) {
    // Malformed id → 404 (the spec's defined error for this route).
    if (err.name === "CastError") {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "Post not found",
      });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({
        status: "error",
        data: {},
        message: "Invalid post data",
      });
    }
    console.error("Update post error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}

// GET /posts — Retrieve all posts.
export async function getAllPosts(req, res) {
  try {
    // Returns [] when none exist. The frontend sorts newest-first client-side.
    const posts = await Post.find();

    return res.status(200).json({
      status: "ok",
      data: { posts },
      message: "Posts retrieved successfully",
    });
  } catch (err) {
    console.error("Get all posts error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}
