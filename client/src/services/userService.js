import { request } from "./apiClient";

const getUserFromPayload = (payload) => payload?.data?.user || payload?.user || null;
const getUsersFromPayload = (payload) => payload?.data?.users || payload?.users || [];

export const getUsers = async () => {
  const payload = await request("/user");

  return {
    users: getUsersFromPayload(payload),
    message: payload?.message || "Users retrieved successfully.",
  };
};

export const getUserById = async (userId) => {
  const payload = await request(`/user/${userId}`);

  return {
    user: getUserFromPayload(payload),
    message: payload?.message || "User retrieved successfully.",
  };
};
