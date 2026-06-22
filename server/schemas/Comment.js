// schemas/Comment.js — Comment Mongoose model (collection: "comments").
//
// A comment on a post. Shape only — no behavior.
// `_id` is the default Mongo-generated ObjectId.
//
// ⚠️ Linked to its Post from both sides (`Comment.post_id` here and
// `Post.comments[]` on the Post); controllers keep both in sync (Issue 8).

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },

  // The post being commented on.
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },

  // The user who wrote the comment.
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  likes: { type: Number, default: 0 },

  // ⚠️ Stored as a String (team decision), not a Date — see Working/Issues.md.
  time_stamp: { type: String, required: true },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
