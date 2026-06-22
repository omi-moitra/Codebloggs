const initialState = {
  ready: true,
  info: "Redux store is configured and ready for future state slices.",
};

const placeholderReducer = (state = initialState, action) => {
  switch (action.type) {
    case "PLACEHOLDER_ACTION":
      return { ...state, lastAction: action.type };
    default:
      return state;
  }
};

export default placeholderReducer;
