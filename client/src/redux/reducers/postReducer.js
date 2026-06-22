// =============================================================================
// reducers/postReducer.js — Post list state slice
// -----------------------------------------------------------------------------
// 1. initialState         posts[], loading flag, error string
// 2. FETCH_POSTS_REQUEST  set loading true (initial fetch)
// 3. FETCH_POSTS_SUCCESS  populate posts array, clear loading
// 4. FETCH_POSTS_FAILURE  store error message, clear loading
// 5. SET_POSTS_LOADING    set loading true/false (used during delete)
// 6. DELETE_POST_SUCCESS  filter deleted post out of the array, clear loading
// 7. DELETE_POST_FAILURE  store error message, clear loading
// =============================================================================

import {
  DELETE_POST_FAILURE,
  DELETE_POST_SUCCESS,
  FETCH_POSTS_FAILURE,
  FETCH_POSTS_REQUEST,
  FETCH_POSTS_SUCCESS,
  SET_POSTS_LOADING,
} from "../actions/actionTypes";

const initialState = {
  posts: [],
  loading: false,
  error: null,
};

const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_POSTS_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_POSTS_SUCCESS:
      return { ...state, loading: false, posts: action.payload };

    case FETCH_POSTS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // SET_POSTS_LOADING is dispatched by deletePostAction before and after the
    // DELETE request so the skeleton renders during the in-flight window.
    case SET_POSTS_LOADING:
      return { ...state, loading: action.payload };

    // ⚠️ Only remove the post from the store on a successful DELETE response.
    // On failure the post stays in the list so the admin sees no phantom removal.
    // loading is cleared here so the skeleton disappears after the delete resolves.
    case DELETE_POST_SUCCESS:
      return {
        ...state,
        loading: false,
        posts: state.posts.filter((p) => p._id !== action.payload),
      };

    case DELETE_POST_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default postReducer;
