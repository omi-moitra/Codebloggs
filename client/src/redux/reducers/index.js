import { combineReducers } from "redux";
import placeholderReducer from "./placeholderReducer";
import userReducer from "./userReducer";

// Combine reducers for Redux state management.
const rootReducer = combineReducers({
  placeholder: placeholderReducer,
  // users slice powers the User Manager (fetch list + delete).
  users: userReducer,
});

export default rootReducer;
