# Feature User API (Create / Get by ID / Get All) Implementation Log

## Files Created

- `server/controllers/user.controller.js`
- `Working/Module_9/implementation_logs/feature user-endpoint implementation log.md`

## Files Modified

- `server/routes/user.routes.js` — wired the three routes to controller handlers.

## What Was Built

The `/user` endpoints for registration and user retrieval:

- **POST /user (create)** — validates required fields, rejects duplicate email with `409`,
  hashes the password with `bcrypt.hash(password, 10)`, forces `auth_level: "basic"` and
  `status: true` server-side (ignores any values sent for those in the body), saves the
  `User`, and returns the created user with the password stripped (`201`).
- **GET /user/:id (get by id)** — `findById().select("-password")`; `404` if not found or if
  the id is a malformed ObjectId (CastError treated as not-found).
- **GET /user (get all)** — `find().select("-password")`; returns an array (empty if none).

All responses use the `{ status, data, message }` contract. Password is excluded from every
response via `.select("-password")` (reads) and `delete` (create).

## Grading Checklist (FSD Grading Sheets — m9.csv, "Feature - Backend /user endpoints")

- [x] **User Endpoint - User Create** — `POST /user` creates a user (registration).
- [x] **User Endpoint - Get User by ID** — `GET /user/:id` retrieves one user.
- [x] **User Endpoint - Get All Users** — `GET /user` retrieves all users.
- [ ] **Postman collection** — NOT created this session (consistent with the prior session-API
      decision to defer Postman). Outstanding grading item; must cover all three endpoints
      (happy path + 409 / 404 error cases) before submission.

## Key Decisions

- Route order: `GET /user` registered before `GET /user/:id` so the collection route is not
  shadowed by the `:id` param route.
- `auth_level` and `status` are never read from the request body — set server-side only, so a
  client cannot self-assign `"admin"` (spec Tech Constraints; flagged with `// ⚠️` in code).
- Added a `400 "Missing required fields"` guard for absent required fields. Not in the spec's
  listed responses, but it converts what would otherwise be a Mongoose `ValidationError` (500)
  into a clear client error. Duplicate-email still returns the spec'd `409`.
- Malformed-id `CastError` returns `404` (the only error the spec defines for that route)
  rather than a `500`.
- bcrypt cost factor 10, per spec. ESM imports; `User` imported from `server/schemas/`.

## Issues Flagged

No new source-document conflicts, so nothing was added to `Working/Issues.md`. The known
`MOD 9.md` discrepancies are already covered:
- `User.status` is Boolean, never a status sentence — Issue 3 (already resolved).
- `password` must never be returned (the `MOD 9.md` sample that includes it is an error) —
  handled here; consistent with Issue 3 notes.

Operational notes:
1. **Postman collection** deferred (see checklist).
2. **Branch name** is `feature/user-endpoint`; the feature spec references `feature/user-api`.
   Cosmetic — flag in case branch-name consistency is graded.

## Intentionally Not Implemented (out of scope)

- User update / delete, password reset, email verification.
- Client-set `auth_level` (always forced to `"basic"`).
- Email-format / password-strength validation (Extra Mile / frontend).
- Any User schema changes (owned by the Schemas feature).

## Verification Results

- `node --check` passed for `user.controller.js` and `user.routes.js`.
- Loaded the router via Node ESM and confirmed three routes register:
  `POST /user`, `GET /user`, `GET /user/:id` (collection route before the param route).
- No live MongoDB integration run this session (requires a reachable `MONGO_URI`). Recommend a
  Postman/curl pass: create → duplicate (409) → get-by-id → unknown-id (404) → get-all.
- The CLIENT folder was not touched, per instructions.
