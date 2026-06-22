// schemas/Post.js — Post Mongoose model (collection: "posts").
//
// A blog post and the comments that belong to it. Shape only — no behavior.
// `_id` is the default Mongo-generated ObjectId.
//
// ⚠️ Post ↔ Comment is linked from BOTH sides (`Post.comments[]` here and
// `Comment.post_id` on the Comment). Controllers must keep both in sync when a
// comment is created (team decision; see Working/Issues.md, Issue 8).

import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },

  // Author of the post.
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  likes: { type: Number, default: 0 },

  // ⚠️ Stored as a String (team decision), not a Date — see Working/Issues.md.
  time_stamp: { type: String, required: true },

  // Comments belonging to this post.
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

const Post = mongoose.model("Post", postSchema);

export default Post;
