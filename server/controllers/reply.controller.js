// controllers/reply.controller.js — Reply API handlers.
//
// Create replies (to Comments or other Replies), update like counts, and
// retrieve all replies for a post. All responses follow { status, data, message }.

import Reply from "../schemas/Reply.js";
import Comment from "../schemas/Comment.js";

// POST /replies — Create a new reply.
export async function createReply(req, res) {
  try {
    const { parent_id, parent_type, root_comment_id, post_id, content, depth } = req.body;

    // user_id is always taken from the validated session — never from the body.
    const user_id = req.user._id;

    // time_stamp is always generated server-side (ISO 8601 string, Issues.md Issue 7).
    const time_stamp = new Date().toISOString();

    // Clamp depth to the supported range. The client enforces max 3 but we
    // validate here as a safety net.
    const safeDepth = Math.min(Math.max(Number(depth) || 1, 1), 3);

    // Verify parent exists before creating an orphan reply.
    if (parent_type === "Comment") {
      const parent = await Comment.findById(parent_id);
      if (!parent) {
        return res.status(404).json({
          status: "error",
          data: {},
          message: "Parent comment not found",
        });
      }
    } else {
      const parent = await Reply.findById(parent_id);
      if (!parent) {
        return res.status(404).json({
          status: "error",
          data: {},
          message: "Parent reply not found",
        });
      }
    }

    const reply = await Reply.create({
      content,
      parent_id,
      parent_type,
      root_comment_id,
      post_id,
      user_id,
      time_stamp,
      depth: safeDepth,
      likes: 0,
    });

    return res.status(201).json({
      status: "ok",
      data: { reply },
      message: "Reply added successfully",
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "Parent not found",
      });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({
        status: "error",
        data: {},
        message: "Invalid reply data",
      });
    }
    console.error("Create reply error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}

// PUT /replies/:id — Increment or decrement a reply's like count.
export async function updateReply(req, res) {
  try {
    const update = {};
    if (req.body.likes !== undefined) update.$inc = { likes: req.body.likes };

    const reply = await Reply.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!reply) {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "Reply not found",
      });
    }

    return res.status(200).json({
      status: "ok",
      data: { reply },
      message: "Reply updated successfully",
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "Reply not found",
      });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({
        status: "error",
        data: {},
        message: "Invalid reply data",
      });
    }
    console.error("Update reply error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}

// GET /replies?post_id=<id> — Retrieve replies, optionally filtered by post.
//
// Returns a flat array ordered by time_stamp. The client is responsible for
// grouping replies by parent_id to reconstruct the nested tree.
// Omitting post_id returns all replies (consistent with GET /comments behaviour).
export async function getRepliesByPost(req, res) {
  try {
    const { post_id } = req.query;
    const filter = post_id ? { post_id } : {};

    const replies = await Reply.find(filter).sort({ time_stamp: 1 });

    return res.status(200).json({
      status: "ok",
      data: { replies },
      message: "Replies retrieved successfully",
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        status: "error",
        data: {},
        message: "Invalid post_id",
      });
    }
    console.error("Get replies error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}
