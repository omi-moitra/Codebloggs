import { PLACEHOLDER_ACTION } from "./actionTypes";

// Placeholder action that can be dispatched later once Redux workflows are added.
export const placeholderAction = () => {
  return (dispatch) => {
    dispatch({
      type: PLACEHOLDER_ACTION,
      payload: { timestamp: Date.now() },
    });
  };
};
