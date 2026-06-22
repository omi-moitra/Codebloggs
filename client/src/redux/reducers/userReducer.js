// =============================================================================
// reducers/userReducer.js — User list state slice
// -----------------------------------------------------------------------------
// 1. initialState        users[], loading flag, error string
// 2. FETCH_USERS_REQUEST set loading true
// 3. FETCH_USERS_SUCCESS populate users array
// 4. FETCH_USERS_FAILURE store error message
// 5. DELETE_USER_SUCCESS filter deleted user out of the array
// 6. DELETE_USER_FAILURE store error message (user stays in array)
// 7. UPDATE_USER_SUCCESS replace updated user in the array
// 8. UPDATE_USER_FAILURE store error message (user stays unchanged)
// =============================================================================

import {
  DELETE_USER_FAILURE,
  DELETE_USER_SUCCESS,
  FETCH_USERS_FAILURE,
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
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

    // ⚠️ Only remove the user from the store on a successful DELETE response.
    // On failure the user stays in the list so the admin sees no phantom removal.
    case DELETE_USER_SUCCESS:
      return {
        ...state,
        users: state.users.filter((u) => u._id !== action.payload),
      };

    case DELETE_USER_FAILURE:
      return { ...state, error: action.payload };

    // ⚠️ Only update the user in the store on a successful PATCH response.
    // On failure the original user object is preserved — the admin sees no
    // phantom changes and can retry after the backend endpoint is delivered.
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
