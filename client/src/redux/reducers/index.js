import { combineReducers } from "redux";
import placeholderReducer from "./placeholderReducer";

// Combine reducers for Redux state management.
const rootReducer = combineReducers({
  placeholder: placeholderReducer,
});

export default rootReducer;
