// =============================================================================
// actions/userActions.js — Redux Thunk actions for user data
// -----------------------------------------------------------------------------
// 1. fetchUsers        GET    /user       — load all users into the store
// 2. deleteUserAction  DELETE /user/:id  — remove user; returns success/fail object
//                      dispatches SET_USERS_LOADING before/after so the skeleton renders
// 3. updateUserAction  PATCH  /user/:id  — update user fields; returns success/fail object
// =============================================================================

import {
  DELETE_USER_FAILURE,
  DELETE_USER_SUCCESS,
  FETCH_USERS_FAILURE,
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
  SET_USERS_LOADING,
  UPDATE_USER_FAILURE,
  UPDATE_USER_SUCCESS,
} from "./actionTypes";
import { getUsers, deleteUser, updateUser } from "../../services/userService";

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
  // SET_USERS_LOADING true before the DELETE so the table body switches to
  // skeleton rows while the request is in flight (spec: delete in flight state).
  dispatch({ type: SET_USERS_LOADING, payload: true });
  try {
    await deleteUser(userId);
    // DELETE_USER_SUCCESS also clears loading in the reducer — the skeleton
    // disappears and the updated user list renders without the deleted entry.
    dispatch({ type: DELETE_USER_SUCCESS, payload: userId });
    return { success: true };
  } catch (err) {
    // DELETE_USER_FAILURE also clears loading in the reducer so the skeleton
    // doesn't stay on-screen indefinitely when the endpoint is unavailable.
    dispatch({ type: DELETE_USER_FAILURE, payload: err.message });
    // Return the error so the component can surface a user-facing message
    // without coupling the component to the raw error shape.
    return { success: false, message: err.message };
  }
};

// ⚠️ PATCH /user/:id is a new M10 endpoint — not yet delivered by the backend
// partner. Until it exists the fetch will return a 404. The action catches the
// error, dispatches UPDATE_USER_FAILURE, and returns { success: false } so the
// EditUserPage can display a graceful inline alert. The Redux store is NOT
// modified on failure — the user object stays unchanged.
export const updateUserAction = (userId, payload) => async (dispatch) => {
  try {
    const { user } = await updateUser(userId, payload);
    dispatch({ type: UPDATE_USER_SUCCESS, payload: user });
    return { success: true };
  } catch (err) {
    dispatch({ type: UPDATE_USER_FAILURE, payload: err.message });
    return { success: false, message: err.message };
  }
};
