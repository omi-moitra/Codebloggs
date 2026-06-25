# BE Implementation Log — User Endpoint

**Feature:** User API — Update User and Delete User  
**Role:** Backend  
**Date:** 2026-06-23  
**Spec:** `ai/Module_10/features/backend/user-endpoint.feature.md`

---

## Files Reviewed

| File | Purpose |
|---|---|
| `ai/Module_10/features/backend/user-endpoint.feature.md` | Module 10 backend user endpoint requirements |
| `server/controllers/user.controller.js` | User create, read, and delete controller logic |
| `server/routes/user.routes.js` | `/user` route registration |

---

## Changes Made

| File | Change |
|---|---|
| `server/controllers/user.controller.js` | Added `updateUser` controller for `PATCH /user/:id` |
| `server/controllers/user.controller.js` | Added ObjectId validation, allowed-field updates, password hashing, duplicate-email handling, and password stripping for update responses |
| `server/controllers/user.controller.js` | Expanded `DELETE /user/:id` reply cleanup so child replies of deleted replies are also removed |
| `server/routes/user.routes.js` | Registered `PATCH /user/:id` route |

---

## Verification Performed

- Confirmed `PATCH /user/:id` is registered in `server/routes/user.routes.js`.
- Confirmed `PATCH /user/:id` validates malformed IDs before querying.
- Confirmed `PATCH /user/:id` returns `404` when the user does not exist.
- Confirmed `PATCH /user/:id` only updates allowed fields.
- Confirmed non-empty password updates are hashed with bcrypt.
- Confirmed missing or empty password values do not overwrite the existing password.
- Confirmed `PATCH /user/:id` strips `password` before returning the updated user.
- Confirmed `DELETE /user/:id` is registered in `server/routes/user.routes.js`.
- Confirmed malformed delete IDs return `400` with `Invalid user id`.
- Confirmed valid but nonexistent users return `404` with `User not found`.
- Confirmed successful deletes return `200` with `User deleted successfully`.
- Confirmed delete logic removes:
  - posts written by the deleted user
  - comments written by the deleted user
  - comments attached to deleted user posts
  - related replies
  - sessions for the deleted user
  - profile picture records for the deleted user
- Confirmed deleted comment IDs are pulled from remaining `Post.comments[]` arrays.
- Confirmed existing `POST /user`, `GET /user`, and `GET /user/:id` routes remain registered.
- Confirmed existing user responses exclude `password`.
- Ran syntax checks:
  - `node --check server/controllers/user.controller.js`
  - `node --check server/routes/user.routes.js`

---

## Issues Found

- The existing delete reply cleanup could remove a parent reply while leaving child replies that point to that deleted reply. This was fixed during review.

---

## Assumptions

- `PATCH /user/:id` is intended for admin use, but no new auth or role-checking middleware was added because the task explicitly said not to add new auth systems.
- Empty password strings mean "do not change the password."
- Duplicate email updates should return `409`, matching the existing duplicate registration behavior.

---

## Remaining Work

- Verify `PATCH /user/:id` live in Postman:
  - valid update returns `200`
  - malformed ID returns `400`
  - nonexistent user returns `404`
  - password updates are hashed
  - password is never returned
- Run live Postman and MongoDB verification for the delete cascade against throwaway test users.
- Update and export `PostmanCollection.json` after backend endpoint testing.
