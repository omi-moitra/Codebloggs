# 🤖 AI_FEATURE_Backend-User-Endpoint

This document describes **one feature of the CodeBloggs project**: the `/user` API endpoints.

It must be read together with:

1. The global AI specification — [`ai/ai-spec.md`](../ai-spec.md)
2. This feature specification

**Source of truth:** `Working/Module_9/FSD Grading Sheets (Shared) - m9.csv` — Sub-Section
"Feature - Backend /user endpoints".

Supporting references: `wireframe-analysis.md` (Registration wireframe, Network wireframe)
and `Working/MOD 9.md` (sample response at line 76, route example at line 64).

This feature depends on:
- **Backend Configuration** — server running, `/user` router mounted
- **Backend Schemas** — `User` model

> ⚠️ `User.status` is a **Boolean** (Issue 3, `Working/Issues.md`). The `MOD 9.md` sample
> response (line 87) shows `status` as a free-text String — that is superseded by the
> team's decision. The API must never return a status sentence.
>
> ⚠️ The `MOD 9.md` sample response (line 86) includes `password` in the response body.
> That is an error in the sample. **Password must never be returned.**

---

## Feature Identity

- **Feature Name:** User API (Create / Get by ID / Get All)
- **Related Area:** Backend

---

## Feature Goal

Allow the frontend to register new users and retrieve user data. This is the entry point
for all new accounts and the data source for user information across the app (Network
cards, Home page user panel, post author initials on Bloggs).

---

## Feature Scope

### In Scope (Included)

- `POST /user` — create a new user (registration).
- `GET /user/:id` — retrieve a single user by MongoDB `_id`.
- `GET /user` — retrieve all users.
- `server/controllers/user.controller.js` — all three handler functions.
- `server/routes/user.routes.js` — route definitions linking path + HTTP method + controller.

### Out of Scope (Excluded)

- User update or delete — not required for this module.
- Password reset or email verification.
- Setting `auth_level` from the client — always hardcoded to `"basic"` server-side.
- Any frontend code.

---

## Sub-Requirements (Feature Breakdown)

- **Create user** — accept registration fields, hash password with bcrypt, force
  `auth_level = "basic"`, save User document, return created user (no password).
- **Get user by ID** — find User by `_id`, return user (no password). Return `404` if not found.
- **Get all users** — return all User documents (no passwords). Return empty array if none exist.

---

## User Flow / Logic (High Level)

### Create User

1. Client sends `POST /user` with registration fields in the body.
2. Check that `email` is not already taken. If duplicate → `409`.
3. Hash `password` with `bcrypt.hash(password, 10)`.
4. Create User with `auth_level: "basic"` and `status: true` forced server-side (ignore any
   values sent for these fields in the request body).
5. Return `201` with the created user (password excluded).

### Get User by ID

1. Client sends `GET /user/:id`.
2. Find User by `_id`. Not found → `404`.
3. Return `200` with user (password excluded).

### Get All Users

1. Client sends `GET /user`.
2. Find all Users.
3. Return `200` with array of users (passwords excluded). Empty array if none exist.

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

None. The frontend calls these routes; it does not define them.

### Backend / API

Route base path is `/user` (singular) — see `Working/Issues.md`, Issue 1.

| Method | Route | Purpose |
| ------ | ----- | ------- |
| `POST` | `/user` | Create new user (registration) |
| `GET` | `/user/:id` | Get single user by MongoDB `_id` |
| `GET` | `/user` | Get all users |

#### POST /user

**Body parameters**

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| `first_name` | String | yes | User's first name |
| `last_name` | String | yes | User's last name |
| `email` | String | yes | Must be unique |
| `password` | String | yes | Plain-text; hashed with bcrypt before storage |
| `birthday` | Date | yes | Date of birth |
| `location` | String | no | User's location |
| `occupation` | String | no | User's occupation |

**Sample request**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "birthday": "1995-12-01",
  "email": "jane@codebloggs.dev",
  "password": "S3curePass!",
  "location": "Florida",
  "occupation": "Developer"
}
```

**Sample response — 201**
```json
{
  "status": "ok",
  "data": {
    "user": {
      "_id": "user-001",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane@codebloggs.dev",
      "birthday": "1995-12-01T00:00:00.000Z",
      "location": "Florida",
      "occupation": "Developer",
      "status": true,
      "auth_level": "basic"
    }
  },
  "message": "Registration successful. Please log in."
}
```

**Sample response — 409**
```json
{ "status": "error", "data": {}, "message": "Email already in use" }
```

#### GET /user/:id

**Path parameter**

| Name | Type | Description |
| ---- | ---- | ----------- |
| `id` | String | MongoDB `_id` of the user |

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
      "birthday": "1995-12-01T00:00:00.000Z",
      "location": "Florida",
      "occupation": "Developer",
      "status": true,
      "auth_level": "basic"
    }
  },
  "message": "User retrieved successfully"
}
```

**Sample response — 404**
```json
{ "status": "error", "data": {}, "message": "User not found" }
```

#### GET /user

**Sample response — 200**
```json
{
  "status": "ok",
  "data": {
    "users": [
      {
        "_id": "user-001",
        "first_name": "Jane",
        "last_name": "Doe",
        "email": "jane@codebloggs.dev",
        "birthday": "1995-12-01T00:00:00.000Z",
        "location": "Florida",
        "occupation": "Developer",
        "status": true,
        "auth_level": "basic"
      }
    ]
  },
  "message": "Users retrieved successfully"
}
```

---

## Data Used or Modified

- **Creates:** `User` document (password stored as bcrypt hash; `auth_level` and `status` always server-set)
- **Reads:** `User` by `_id`, or all `User` documents
- **Never returns:** `password` in any response

---

## Tech Constraints (Feature-Level)

- `auth_level` must always be set to `"basic"` server-side. ⚠️ Ignore any `auth_level`
  value in the request body — never let the client set their own authorization level.
- `status` defaults to `true` (Boolean) per the schema. Do not accept it from the request.
- Hash password with `bcrypt.hash(password, 10)` before saving. Never store plain text.
- Exclude password from all responses with `.select("-password")`.
- All responses follow `{ status, data, message }` per `ai-spec.md`.
- Files: `server/controllers/user.controller.js` and `server/routes/user.routes.js`.

---

## Acceptance Criteria

Grading checklist (from `FSD Grading Sheets (Shared) - m9.csv`):

- [ ] **User Endpoint — User Create:** a route creates a new user (used by the registration page).
- [ ] **User Endpoint — Get User by ID:** a route retrieves a single user by ID.
- [ ] **User Endpoint — Get All Users:** a route retrieves all users.

Additional verification:

- [ ] `POST /user` hashes the password with bcrypt before saving.
- [ ] `POST /user` always forces `auth_level = "basic"` regardless of request body.
- [ ] `POST /user` returns the created user without password.
- [ ] `POST /user` with a duplicate email returns `409`.
- [ ] `GET /user/:id` with a valid ID returns the user without password.
- [ ] `GET /user/:id` with an unknown ID returns `404`.
- [ ] `GET /user` returns all users without passwords (empty array if none).
- [ ] All responses use `{ status, data, message }` shape.
- [ ] Postman collection covers all three endpoints (happy path + error cases).
- [ ] No console or lint errors; ready to merge into `dev` from `feature/user-endpoint`.

---

## Notes for the AI

- Add a `// ⚠️` comment where `auth_level` is forced to `"basic"` explaining the client
  must never be able to set their own authorization level.
- Add a `// ⚠️` comment where the password is excluded from the response.
- `User.status` is a **Boolean** — the `MOD 9.md` sample shows a String sentence; that is
  superseded by the team decision (Issues.md, Issue 3).
- Keep changes scoped to `user.controller.js` and `user.routes.js` only.
- Do not modify the User schema — it is owned by the Schemas feature.
