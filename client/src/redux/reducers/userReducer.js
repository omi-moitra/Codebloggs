// =============================================================================
// reducers/userReducer.js — User list state slice
// -----------------------------------------------------------------------------
// 1. initialState        users[], loading flag, error string
// 2. FETCH_USERS_REQUEST set loading true (initial fetch)
// 3. FETCH_USERS_SUCCESS populate users array, clear loading
// 4. FETCH_USERS_FAILURE store error message, clear loading
// 5. SET_USERS_LOADING   set loading true/false (used during delete)
// 6. DELETE_USER_SUCCESS filter deleted user out of the array, clear loading
// 7. DELETE_USER_FAILURE store error message, clear loading
// 8. UPDATE_USER_SUCCESS replace updated user in the array
// 9. UPDATE_USER_FAILURE store error message (user stays unchanged)
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
} from "../actions/actionTypes";

const initialState = {
  users: [],
  loading: false,
  error: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USERS_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_USERS_SUCCESS:
      return { ...state, loading: false, users: action.payload };

    case FETCH_USERS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // SET_USERS_LOADING is dispatched by deleteUserAction before and after the
    // DELETE request so the skeleton renders during the in-flight window.
    case SET_USERS_LOADING:
      return { ...state, loading: action.payload };

    // ⚠️ Only remove the user from the store on a successful DELETE response.
    // On failure the user stays in the list so the admin sees no phantom removal.
    // loading is cleared here so the skeleton disappears after the delete resolves.
    case DELETE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.filter((u) => u._id !== action.payload),
      };

    case DELETE_USER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ⚠️ Only update the user in the store on a successful PATCH response.
    // On failure the original user object is preserved — the admin sees no phantom changes.
    case UPDATE_USER_SUCCESS:
      return {
        ...state,
        users: state.users.map((u) =>
          u._id === action.payload._id ? action.payload : u
        ),
      };

    case UPDATE_USER_FAILURE:
      return { ...state, error: action.payload };

    default:
      return state;
  }
};

export default userReducer;
