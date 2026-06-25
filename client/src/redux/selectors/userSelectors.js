import { createSelector } from "reselect";

const resolveId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.$oid || String(value);
};

export const selectUsersById = createSelector(
  (state) => state.users.users,
  (users) =>
    users.reduce((map, u) => {
      map[resolveId(u._id)] = u;
      return map;
    }, {})
);
