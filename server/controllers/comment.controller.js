// controllers/comment.controller.js — Comment API handlers.
//
// Create comments (kept in sync with the parent post), update a comment's text,
// and read all comments. All responses follow { status, data, message }.

import mongoose from "mongoose";

import Comment from "../schemas/Comment.js";
import Post from "../schemas/Post.js";
import Reply from "../schemas/Reply.js";

// POST /comments — Create a new comment.
export async function createComment(req, res) {
  try {
    const { content, post_id } = req.body;

    // user_id is always taken from the validated session (set by requireSession
    // middleware) — never from the request body, so clients cannot impersonate
    // another user.
    const user_id = req.user._id;

    // time_stamp is always generated server-side so clients cannot supply
    // backdated or future-dated values. Stored as an ISO 8601 string per
    // Issues.md Issue 7.
    const time_stamp = new Date().toISOString();

    // Verify the parent Post exists BEFORE saving the comment — if it doesn't,
    // abort with 404 so we never create an orphan comment.
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "Post not found",
      });
    }

    // ⚠️ likes is always set to 0 server-side on create (never read from the body).
    const comment = await Comment.create({
      content,
      post_id,
      user_id,
      time_stamp,
      likes: 0,
    });

    // ⚠️ Two-way Post ↔ Comment link (Working/Issues.md, Issue 8): the Comment
    // stores post_id, AND the Post stores the comment's _id in its comments[].
    // Both sides must be kept in sync, so after saving the Comment we $push its
    // _id onto the parent Post.
    await Post.findByIdAndUpdate(post_id, {
      $push: { comments: comment._id },
    });

    return res.status(201).json({
      status: "ok",
      data: { comment },
      message: "Comment added successfully",
    });
  } catch (err) {
    // Malformed post_id (CastError) → treat as Post not found per the spec.
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
        message: "Invalid comment data",
      });
    }
    console.error("Create comment error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}

// PATCH /comments/:id — Update a comment (content and/or likes).
export async function updateComment(req, res) {
  try {
    // Only `content` and `likes` are updatable. post_id, user_id, and
    // time_stamp are permanently fixed at creation and cannot be changed.
    const update = {};
    if (req.body.content !== undefined) update.$set = { content: req.body.content };
    if (req.body.likes !== undefined) update.$inc = { likes: req.body.likes };

    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!comment) {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      status: "ok",
      data: { comment },
      message: "Comment updated successfully",
    });
  } catch (err) {
    // Malformed id → 404 (the spec's defined error for this route).
    if (err.name === "CastError") {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "Comment not found",
      });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({
        status: "error",
        data: {},
        message: "Invalid comment data",
      });
    }
    console.error("Update comment error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}

// GET /comments — Retrieve all comments.
export async function getAllComments(req, res) {
  try {
    // Returns [] when none exist. The frontend groups comments by post_id.
    const comments = await Comment.find();

    return res.status(200).json({
      status: "ok",
      data: { comments },
      message: "Comments retrieved successfully",
    });
  } catch (err) {
    console.error("Get all comments error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}

// DELETE /comments/:id — Delete a comment and clean up related replies.
export async function deleteComment(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        data: {},
        message: "Invalid comment id",
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "Comment not found",
      });
    }

    await Reply.deleteMany({
      $or: [
        { root_comment_id: id },
        { parent_id: id },
      ],
    });

    await Post.findByIdAndUpdate(comment.post_id, {
      $pull: { comments: comment._id },
    });

    await Comment.findByIdAndDelete(id);

    return res.status(200).json({
      status: "ok",
      data: {},
      message: "Comment deleted successfully",
    });
  } catch (err) {
    console.error("Delete comment error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}
