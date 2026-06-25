// controllers/user.controller.js — User API handlers.
//
// Implements user creation (registration) and retrieval. Passwords are hashed
// with bcrypt before storage and never returned. All responses follow the
// project contract { status, data, message }.

import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

import User from "../schemas/User.js";
import Post from "../schemas/Post.js";
import Comment from "../schemas/Comment.js";
import Session from "../schemas/Session.js";
import Reply from "../schemas/Reply.js";
import ProfilePic from "../schemas/ProfilePic.js";

// bcrypt cost factor. 10 is the project standard (balances security and speed).
const SALT_ROUNDS = 10;

// POST /user — Create a new user (registration).
export async function createUser(req, res) {
  try {
    const { first_name, last_name, email, password, birthday, location, occupation } =
      req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        data: {},
        message: errors.array()[0].msg,
      });
    }

    if (!password || !birthday) {
      return res.status(400).json({
        status: "error",
        data: {},
        message: "Missing required fields",
      });
    }

    // Reject duplicate emails before hashing/saving.
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        status: "error",
        data: {},
        message: "Email already in use",
      });
    }

    // Hash the password — never store plain text.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // ⚠️ auth_level is ALWAYS set server-side. We deliberately do NOT read it
    // from req.body — a client must never be able to grant itself "admin".
    // `status` is intentionally omitted: it defaults to false (logged out) and
    // is toggled true only when the user logs in via the Session API.
    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      birthday,
      location, // optional
      occupation, // optional
      auth_level: "basic",
    });

    // ⚠️ Strip the password before returning. Convert the Mongoose doc to a
    // plain object first so delete works.
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(201).json({
      status: "ok",
      data: { user: safeUser },
      message: "Registration successful. Please log in.",
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map(e => e.message).join(". ");
      return res.status(400).json({ status: "error", data: {}, message });
    }
    console.error("Create user error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}

// GET /user/:id — Retrieve a single user by MongoDB _id.
export async function getUserById(req, res) {
  try {
    // ⚠️ .select("-password") excludes the hash from the query result entirely.
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "ok",
      data: { user },
      message: "User retrieved successfully",
    });
  } catch (err) {
    // ⚠️ A malformed id (not a valid ObjectId) throws a CastError. Treat it as
    // "not found" rather than a 500 — the spec only defines a 404 for this route.
    if (err.name === "CastError") {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "User not found",
      });
    }
    console.error("Get user by id error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}

// GET /user — Retrieve all users.
export async function getAllUsers(req, res) {
  try {
    // Exclude passwords from every document. Returns [] when none exist.
    const users = await User.find().select("-password");

    return res.status(200).json({
      status: "ok",
      data: { users },
      message: "Users retrieved successfully",
    });
  } catch (err) {
    console.error("Get all users error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}

// PATCH /user/:id — Update allowed user fields by MongoDB _id.
export async function updateUser(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        data: {},
        message: "Invalid user id",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "User not found",
      });
    }

    const allowedFields = [
      "first_name",
      "last_name",
      "birthday",
      "email",
      "status",
      "location",
      "occupation",
      "auth_level",
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (req.body.password !== undefined && req.body.password !== "") {
      user.password = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    }

    await user.save();

    // Never return the password hash in API responses.
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      status: "ok",
      data: { user: safeUser },
      message: "User updated successfully",
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map(e => e.message).join(". ");
      return res.status(400).json({ status: "error", data: {}, message });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        status: "error",
        data: {},
        message: "Email already in use",
      });
    }

    console.error("Update user error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}

// DELETE /user/:id — Delete a user and clean up related data.
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        data: {},
        message: "Invalid user id",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "User not found",
      });
    }

    const userPosts = await Post.find({ user_id: id }).select("_id");
    const postIds = userPosts.map(post => post._id);

    const commentsToDelete = await Comment.find({
      $or: [
        { user_id: id },
        { post_id: { $in: postIds } },
      ],
    }).select("_id");
    const commentIds = commentsToDelete.map(comment => comment._id);

    const repliesToDelete = await Reply.find({
      $or: [
        { user_id: id },
        { post_id: { $in: postIds } },
        { root_comment_id: { $in: commentIds } },
        { parent_type: "Comment", parent_id: { $in: commentIds } },
      ],
    }).select("_id");
    const replyIdStrings = new Set(repliesToDelete.map(reply => reply._id.toString()));
    let parentReplyIds = repliesToDelete.map(reply => reply._id);

    // Include child replies so no reply points at a deleted parent reply.
    while (parentReplyIds.length > 0) {
      const childReplies = await Reply.find({
        parent_type: "Reply",
        parent_id: { $in: parentReplyIds },
      }).select("_id");

      const newChildIds = childReplies
        .filter(reply => !replyIdStrings.has(reply._id.toString()))
        .map(reply => reply._id);

      newChildIds.forEach(replyId => replyIdStrings.add(replyId.toString()));
      parentReplyIds = newChildIds;
    }

    await Reply.deleteMany({ _id: { $in: Array.from(replyIdStrings) } });

    await Comment.deleteMany({ _id: { $in: commentIds } });

    await Post.updateMany(
      {},
      { $pull: { comments: { $in: commentIds } } }
    );

    await Post.deleteMany({ _id: { $in: postIds } });
    await Session.deleteMany({ user: id });
    await ProfilePic.deleteMany({ user_id: id });
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      status: "ok",
      data: {},
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error",
    });
  }
}
