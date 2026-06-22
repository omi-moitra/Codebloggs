// schemas/Reply.js — Reply Mongoose model (collection: "replies").
//
// A reply to a Comment or to another Reply (nested threading, max depth 3).
// One schema covers all nesting levels — depth field distinguishes them.
// Does NOT modify the Comment schema.
//
// `parent_id` points to the immediate parent (Comment or Reply).
// `root_comment_id` always points to the top-level Comment for easy bulk fetch.

import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  content: { type: String, required: true },

  // Immediate parent — either a Comment (depth 1) or a Reply (depth 2+).
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  // Discriminates which collection parent_id belongs to.
  parent_type: {
    type: String,
    enum: ["Comment", "Reply"],
    required: true,
  },

  // Always the top-level Comment._id — used to fetch all replies for a post
  // in a single query without recursive lookups.
  root_comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    required: true,
  },

  // The post this reply ultimately belongs to (mirrors Comment.post_id).
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },

  // The user who wrote the reply.
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Incremented/decremented via $inc — never set directly after creation.
  likes: { type: Number, default: 0 },

  // ⚠️ Stored as a String (ISO 8601), matching Comment convention (Issues.md Issue 7).
  time_stamp: { type: String, required: true },

  // Nesting level: 1 = direct reply to a Comment, 2 = reply to a reply, 3 = max.
  depth: { type: Number, default: 1, min: 1, max: 3 },
});

const Reply = mongoose.model("Reply", replySchema);

export default Reply;
