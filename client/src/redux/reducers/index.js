import { combineReducers } from "redux";
import placeholderReducer from "./placeholderReducer";
import userReducer from "./userReducer";
import postReducer from "./postReducer";

// Combine reducers for Redux state management.
const rootReducer = combineReducers({
  placeholder: placeholderReducer,
  // users slice powers the User Manager (fetch list + delete + update).
  users: userReducer,
  // posts slice powers the Content Manager (fetch list + delete).
  posts: postReducer,
});

export default rootReducer;
