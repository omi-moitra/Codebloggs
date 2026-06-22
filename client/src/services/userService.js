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

// ⚠️ PATCH /user/:id is a new M10 endpoint — not yet delivered by the backend
// partner. The payload is a partial object; password is only included when the
// admin entered a new one (never send password: "" to the backend).
export const updateUser = async (userId, payload) => {
  const data = await request(`/user/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  // The backend may return the updated user wrapped in { data: { user } },
  // { user }, or as the top-level object — normalise with the same pattern
  // used by getUserById above.
  const user = getUserFromPayload(data) || data;

  return {
    user,
    message: data?.message || "User updated successfully.",
  };
};
