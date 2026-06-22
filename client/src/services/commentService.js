import { request } from "./apiClient";

const getCommentsFromPayload = (payload) =>
  payload?.data?.comments || payload?.comments || [];
const getCommentFromPayload = (payload) => payload?.data?.comment || payload?.comment || null;

export const getComments = async () => {
  const payload = await request("/comments");

  return {
    comments: getCommentsFromPayload(payload),
    message: payload?.message || "Comments retrieved successfully.",
  };
};

export const createComment = async ({ postId, content }) => {
  const payload = await request("/comments", {
    method: "POST",
    body: JSON.stringify({
      post_id: postId,
      content,
    }),
  });

  return {
    comment: getCommentFromPayload(payload),
    message: payload?.message || "Comment added successfully.",
  };
};

export const updateCommentLikes = async (commentId, likes) => {
  const payload = await request(`/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ likes }),
  });

  return {
    comment: getCommentFromPayload(payload),
    message: payload?.message || "Comment updated successfully.",
  };
};
