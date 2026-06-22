// =============================================================================
// actions/userActions.js — Redux Thunk actions for user data
// -----------------------------------------------------------------------------
// 1. fetchUsers        GET  /user       — load all users into the store
// 2. deleteUserAction  DELETE /user/:id — remove user; returns success/fail object
// =============================================================================

import {
  DELETE_USER_FAILURE,
  DELETE_USER_SUCCESS,
  FETCH_USERS_FAILURE,
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
} from "./actionTypes";
import { getUsers, deleteUser } from "../../services/userService";

// Fetch all users from GET /user and store them in the Redux users slice.
export const fetchUsers = () => async (dispatch) => {
  dispatch({ type: FETCH_USERS_REQUEST });

  try {
    const { users } = await getUsers();
    dispatch({ type: FETCH_USERS_SUCCESS, payload: users });
  } catch (err) {
    dispatch({ type: FETCH_USERS_FAILURE, payload: err.message });
  }
};

// ⚠️ DELETE /user/:id is a new M10 endpoint — not yet delivered by the backend
// partner. Until it exists the fetch will return a 404. The action catches the
// error, dispatches DELETE_USER_FAILURE, and returns { success: false } so the
// component can display a graceful error message. No change to this file is
// needed once the endpoint is live — the same call succeeds automatically.
export const deleteUserAction = (userId) => async (dispatch) => {
  try {
    await deleteUser(userId);
    dispatch({ type: DELETE_USER_SUCCESS, payload: userId });
    return { success: true };
  } catch (err) {
    dispatch({ type: DELETE_USER_FAILURE, payload: err.message });
    // Return the error so the component can surface a user-facing message
    // without coupling the component to the raw error shape.
    return { success: false, message: err.message };
  }
};
