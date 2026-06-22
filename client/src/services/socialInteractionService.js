const LIKE_STATE_KEY = "codebloggs:social-interaction-likes";

const readLikeState = () => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(LIKE_STATE_KEY)) || {};
  } catch {
    return {};
  }
};

const writeLikeState = (state) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LIKE_STATE_KEY, JSON.stringify(state));
};

const getLikeKey = ({ type, userId, itemId }) => `${type}:${userId || "guest"}:${itemId}`;

export const hasLocalLike = ({ type, userId, itemId }) => {
  const state = readLikeState();
  return Boolean(state[getLikeKey({ type, userId, itemId })]);
};

export const setLocalLike = ({ type, userId, itemId, liked }) => {
  const state = readLikeState();
  const key = getLikeKey({ type, userId, itemId });

  if (liked) {
    state[key] = true;
  } else {
    delete state[key];
  }

  writeLikeState(state);
};
