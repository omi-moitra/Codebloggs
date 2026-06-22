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

// ⚠️ DELETE /user/:id is a new M10 endpoint. The backend handles all cascade
// deletion (posts + comments) — the frontend only calls this and removes the
// user from the Redux store on success. No cascade logic lives here.
export const deleteUser = async (userId) => {
  const payload = await request(`/user/${userId}`, { method: "DELETE" });

  return {
    message: payload?.message || "User deleted successfully.",
  };
};
