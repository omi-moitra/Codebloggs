import { request } from "./apiClient";

const getActiveUserIdsFromPayload = (payload) =>
  payload?.data?.activeUserIds || payload?.activeUserIds || [];

// Fetch the ids of users who are online right now. Because /presence is an
// authenticated request, calling this also refreshes the caller's own presence
// on the server — so polling it doubles as the heartbeat.
export const getPresence = async () => {
  const payload = await request("/presence");

  return {
    activeUserIds: getActiveUserIdsFromPayload(payload).map(String),
    message: payload?.message || "Presence retrieved successfully.",
  };
};
