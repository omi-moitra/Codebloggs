// Action type constants help keep Redux actions consistent.
export const PLACEHOLDER_ACTION = "PLACEHOLDER_ACTION";

// User action types — used by the User Manager (fetch + delete) and Edit User page.
export const FETCH_USERS_REQUEST = "FETCH_USERS_REQUEST";
export const FETCH_USERS_SUCCESS = "FETCH_USERS_SUCCESS";
export const FETCH_USERS_FAILURE = "FETCH_USERS_FAILURE";
export const DELETE_USER_SUCCESS = "DELETE_USER_SUCCESS";
export const DELETE_USER_FAILURE = "DELETE_USER_FAILURE";
export const UPDATE_USER_SUCCESS = "UPDATE_USER_SUCCESS";
export const UPDATE_USER_FAILURE = "UPDATE_USER_FAILURE";
// SET_USERS_LOADING is used by deleteUserAction to turn on the skeleton while
// the DELETE request is in flight — separate from FETCH_USERS_REQUEST so the
// semantic distinction between "loading for fetch" vs "loading for delete" is clear.
export const SET_USERS_LOADING = "SET_USERS_LOADING";

// Post action types — used by the Content Manager (fetch + delete).
export const FETCH_POSTS_REQUEST = "FETCH_POSTS_REQUEST";
export const FETCH_POSTS_SUCCESS = "FETCH_POSTS_SUCCESS";
export const FETCH_POSTS_FAILURE = "FETCH_POSTS_FAILURE";
export const DELETE_POST_SUCCESS = "DELETE_POST_SUCCESS";
export const DELETE_POST_FAILURE = "DELETE_POST_FAILURE";
// SET_POSTS_LOADING mirrors SET_USERS_LOADING for the posts slice.
export const SET_POSTS_LOADING = "SET_POSTS_LOADING";
