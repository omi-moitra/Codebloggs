// =============================================================================
// actions/postActions.js — Redux Thunk actions for post data
// -----------------------------------------------------------------------------
// 1. fetchPosts        GET    /posts       — load all posts into the store
// 2. deletePostAction  DELETE /posts/:id  — remove post; returns success/fail object
// =============================================================================

import {
  DELETE_POST_FAILURE,
  DELETE_POST_SUCCESS,
  FETCH_POSTS_FAILURE,
  FETCH_POSTS_REQUEST,
  FETCH_POSTS_SUCCESS,
} from "./actionTypes";
import { getPosts, deletePost } from "../../services/postService";

// Fetch all posts from GET /posts and store them in the Redux posts slice.
// All date filtering is done client-side on the returned array — no query
// parameters are added to the fetch call.
export const fetchPosts = () => async (dispatch) => {
  dispatch({ type: FETCH_POSTS_REQUEST });

  try {
    const { posts } = await getPosts();
    dispatch({ type: FETCH_POSTS_SUCCESS, payload: posts });
  } catch (err) {
    dispatch({ type: FETCH_POSTS_FAILURE, payload: err.message });
  }
};

// ⚠️ DELETE /posts/:id is a new M10 endpoint — not yet delivered by the backend
// partner. Until it exists the fetch will return a 404. The action catches the
// error, dispatches DELETE_POST_FAILURE, and returns { success: false } so the
// component can display a graceful error message. No change to this file is
// needed once the endpoint is live — the same call succeeds automatically.
export const deletePostAction = (postId) => async (dispatch) => {
  try {
    await deletePost(postId);
    dispatch({ type: DELETE_POST_SUCCESS, payload: postId });
    return { success: true };
  } catch (err) {
    dispatch({ type: DELETE_POST_FAILURE, payload: err.message });
    // Return the error so the component can surface a user-facing message
    // without coupling the component to the raw error shape.
    return { success: false, message: err.message };
  }
};
