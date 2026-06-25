import { request } from "./apiClient";

const getReplyFromPayload = (payload) => payload?.data?.reply || payload?.reply || null;
const getRepliesFromPayload = (payload) => payload?.data?.replies || payload?.replies || [];

// GET /replies — fetch all replies (or ?post_id=<id> for a specific post).
export const getReplies = async (postId) => {
  const path = postId ? `/replies?post_id=${postId}` : "/replies";
  const payload = await request(path);

  return {
    replies: getRepliesFromPayload(payload),
    message: payload?.message || "Replies retrieved successfully.",
  };
};

// POST /replies — create a reply to a comment or another reply.
// parentType must be "Comment" or "Reply".
export const createReply = async ({
  parentId,
  parentType,
  rootCommentId,
  postId,
  content,
  depth,
}) => {
  const payload = await request("/replies", {
    method: "POST",
    body: JSON.stringify({
      parent_id: parentId,
      parent_type: parentType,
      root_comment_id: rootCommentId,
      post_id: postId,
      content,
      depth,
    }),
  });

  return {
    reply: getReplyFromPayload(payload),
    message: payload?.message || "Reply added successfully.",
  };
};

// DELETE /replies/:id — admin removes a reply and its child replies.
export const deleteReply = async (replyId) => {
  const payload = await request(`/replies/${replyId}`, { method: "DELETE" });

  return {
    message: payload?.message || "Reply deleted successfully.",
  };
};

// PUT /replies/:id — increment or decrement like count (server uses $inc).
export const updateReplyLikes = async (replyId, likesDelta) => {
  const payload = await request(`/replies/${replyId}`, {
    method: "PUT",
    body: JSON.stringify({ likes: likesDelta }),
  });

  return {
    reply: getReplyFromPayload(payload),
    message: payload?.message || "Reply updated successfully.",
  };
};
