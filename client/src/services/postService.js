import { request } from "./apiClient";

const getPostsFromPayload = (payload) => payload?.data?.posts || payload?.posts || [];
const getPostFromPayload = (payload) => payload?.data?.post || payload?.post || null;

export const getPosts = async () => {
  const payload = await request("/posts");

  return {
    posts: getPostsFromPayload(payload),
    message: payload?.message || "Posts retrieved successfully.",
  };
};

export const createPost = async ({ content }) => {
  const payload = await request("/posts", {
    method: "POST",
    body: JSON.stringify({
      content,
    }),
  });

  return {
    post: getPostFromPayload(payload),
    message: payload?.message || "Post created successfully.",
  };
};

export const updatePostLikes = async (postId, likes) => {
  const payload = await request(`/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify({ likes }),
  });

  return {
    post: getPostFromPayload(payload),
    message: payload?.message || "Post updated successfully.",
  };
};
