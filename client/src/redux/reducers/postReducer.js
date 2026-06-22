// =============================================================================
// reducers/postReducer.js — Post list state slice
// -----------------------------------------------------------------------------
// 1. initialState         posts[], loading flag, error string
// 2. FETCH_POSTS_REQUEST  set loading true
// 3. FETCH_POSTS_SUCCESS  populate posts array
// 4. FETCH_POSTS_FAILURE  store error message
// 5. DELETE_POST_SUCCESS  filter deleted post out of the array
// 6. DELETE_POST_FAILURE  store error message (post stays in array)
// =============================================================================

import {
  DELETE_POST_FAILURE,
  DELETE_POST_SUCCESS,
  FETCH_POSTS_FAILURE,
  FETCH_POSTS_REQUEST,
  FETCH_POSTS_SUCCESS,
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

    // ⚠️ Only remove the post from the store on a successful DELETE response.
    // On failure the post stays in the list so the admin sees no phantom removal.
    case DELETE_POST_SUCCESS:
      return {
        ...state,
        posts: state.posts.filter((p) => p._id !== action.payload),
      };

    case DELETE_POST_FAILURE:
      return { ...state, error: action.payload };

    default:
      return state;
  }
};

export default postReducer;
