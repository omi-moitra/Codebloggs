# 🤖 AI_FEATURE_Backend-Session-Endpoint

This document describes **one feature of the CodeBloggs project**: the `/session` API endpoints.

It must be read together with:

1. The global AI specification — [`ai/ai-spec.md`](../ai-spec.md)
2. This feature specification

**Source of truth:** `Working/Module_9/FSD Grading Sheets (Shared) - m9.csv` — Sub-Section
"Feature - Backend /session endpoints".

This feature depends on:
- **Backend Configuration** — server running, `/session` router mounted, cookie-parser active
- **Backend Schemas** — `Session` model (`session_id`, `session_date`, `user`), `User` model

> ⚠️ `Session` has no `expiry` field (see `Working/Issues.md`, Issue 4). Expiration is
> computed at validation time as `session_date + SESSION_TTL`.

---

## Feature Identity

- **Feature Name:** Session API (Login / Logout / Validate)
- **Related Area:** Backend

---

## Feature Goal

Enable cookie-based authentication: a client can log in and receive a session cookie, log
out to destroy it, and any protected page can validate the cookie to confirm the user's
identity before rendering.

---

## Feature Scope

### In Scope (Included)

- `POST /session` — login: verify credentials, create a Session document, set the session cookie.
- `DELETE /session` — logout: destroy the Session document, clear the cookie, return user to login.
- `GET /session/validate` — validate: read the cookie, confirm the session exists and is not
  expired, return the user.
- `server/controllers/session.controller.js` — all three handler functions.
- `server/routes/session.routes.js` — route definitions linking path + HTTP method + controller.

### Out of Scope (Excluded)

- Password hashing — bcrypt is handled in the User API; passwords arrive already hashed in the DB.
- User creation — owned by the User API.
- Any frontend code.
- Token refresh, multi-device sessions, or OAuth.

---

## Sub-Requirements (Feature Breakdown)

- **Login** — find user by email, compare password against bcrypt hash, generate a unique
  `session_id`, create a Session document, set an HTTP-only cookie named `session_token`,
  return the user (no password).
- **Logout** — read `session_token` from the cookie, delete the matching Session document,
  clear the cookie, return success.
- **Validate** — read `session_token` from the cookie, find the Session document, check
  `session_date + SESSION_TTL > now`, populate and return the user (no password). Return
  `401` if the cookie is missing, the session is not found, or the session is expired.

---

## User Flow / Logic (High Level)

### Login

1. Client sends `POST /session` with `{ email, password }`.
2. Find `User` by `email`. Not found → `401`.
3. `bcrypt.compare(password, user.password)`. Mismatch → `401`.
4. Generate `session_id` via `crypto.randomUUID()`.
5. Create `Session`: `{ session_id, session_date: new Date(), user: user._id }`.
6. Set HTTP-only cookie `session_token = session_id` on the response.
7. Return `200` with user object (password excluded).

### Logout

1. Client sends `DELETE /session` (cookie sent automatically).
2. Read `session_token` from `req.cookies`.
3. Delete `Session` where `session_id` matches. If none found → still `200` (idempotent).
4. Clear cookie `session_token`.
5. Return `200` with success message.

### Validate

1. Client sends `GET /session/validate` (cookie sent automatically).
2. Read `session_token` from `req.cookies`. Missing → `401`.
3. Find `Session` where `session_id` matches. Not found → `401`.
4. Check `session_date + SESSION_TTL > now`. Expired → delete Session, clear cookie → `401`.
5. Populate `user` from Session. Return `200` with user object (password excluded).

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

None. The frontend calls these routes; it does not define them.

### Backend / API

| Method | Route | Purpose |
| ------ | ----- | ------- |
| `POST` | `/session` | Login — create session |
| `DELETE` | `/session` | Logout — destroy session |
| `GET` | `/session/validate` | Validate session cookie |

#### POST /session

**Body parameters**

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| `email` | String | yes | User's email address |
| `password` | String | yes | Plain-text password (compared against bcrypt hash) |

**Sample request**
```json
{ "email": "jane@codebloggs.dev", "password": "S3curePass!" }
```

**Sample response — 200**
```json
{
  "status": "ok",
  "data": {
    "user": {
      "_id": "user-001",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane@codebloggs.dev",
      "auth_level": "basic",
      "status": true
    }
  },
  "message": "Login successful"
}
```

> The `session_token` cookie is set on the response — not in the body.

**Sample response — 401**
```json
{ "status": "error", "data": {}, "message": "Invalid email or password" }
```

#### DELETE /session

Cookie `session_token` sent automatically by the browser.

**Sample response — 200**
```json
{ "status": "ok", "data": {}, "message": "Logged out successfully" }
```

#### GET /session/validate

Cookie `session_token` sent automatically by the browser.

**Sample response — 200**
```json
{
  "status": "ok",
  "data": {
    "user": {
      "_id": "user-001",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane@codebloggs.dev",
      "auth_level": "basic",
      "status": true
    }
  },
  "message": "Session is valid"
}
```

**Sample response — 401**
```json
{ "status": "error", "data": {}, "message": "Unauthorized" }
```

---

## Data Used or Modified

- **Reads:** `User` (by `email` on login; populate on validate)
- **Creates:** `Session` (`session_id`, `session_date`, `user` ref)
- **Deletes:** `Session` (on logout, or expired on validate)
- **Never returns:** `password`, `session_id` in the response body

---

## Tech Constraints (Feature-Level)

- Cookie name: `session_token` — must match the key used by `react-use-cookie` on the frontend.
- Cookie must be `httpOnly: true`. ⚠️ Do **not** set `secure: true` in local dev (HTTP only).
- `session_id` generation: `crypto.randomUUID()` — no extra packages.
- ⚠️ **No `expiry` field on Session** — define `SESSION_TTL` as a constant (e.g. 24 hours in
  ms) in the controller and derive expiration as `session_date.getTime() + SESSION_TTL`.
- Password must never appear in any response. Use `.select("-password")` or delete before returning.
- All responses follow `{ status, data, message }` per `ai-spec.md`.
- Files: `server/controllers/session.controller.js` and `server/routes/session.routes.js`.

---

## Acceptance Criteria

Grading checklist (from `FSD Grading Sheets (Shared) - m9.csv`):

- [ ] **Session Endpoint — Login:** a backend route handles user login and session creation.
- [ ] **Session Endpoint — Logout:** a route handles logout, clears the session, and returns the user to the login page.
- [ ] **Session Endpoint — Session Validation:** a route validates a session (checks token and expiration).

Additional verification:

- [ ] `POST /session` with valid credentials sets `session_token` cookie and returns user (no password).
- [ ] `POST /session` with wrong credentials returns `401`.
- [ ] `DELETE /session` deletes the Session document and clears the cookie.
- [ ] `GET /session/validate` with a valid non-expired cookie returns the user.
- [ ] `GET /session/validate` with a missing, invalid, or expired cookie returns `401`.
- [ ] All responses use `{ status, data, message }` shape.
- [ ] Password never appears in any response.
- [ ] Postman collection covers all three endpoints (happy path + error cases).
- [ ] No console or lint errors; ready to merge into `dev` from `feature/session-api`.

---

## Notes for the AI

- Add a `// ⚠️` comment near `SESSION_TTL` explaining there is no `expiry` field and that
  expiration is derived at runtime.
- Add a `// ⚠️` comment on the `httpOnly` cookie flag explaining why it is required for
  cookie-based auth (most common beginner mistake).
- Do not add a global session-validation middleware; the frontend calls
  `GET /session/validate` on each protected page and handles redirection.
- Keep changes scoped to `session.controller.js` and `session.routes.js` only.
