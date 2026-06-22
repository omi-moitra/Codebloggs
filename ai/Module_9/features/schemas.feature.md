# 🤖 AI_FEATURE_Backend-Schemas

This document describes **one feature of the CodeBloggs project**: the backend data schemas
(Mongoose models).

It must be read together with:

1. The global AI specification — [`ai/ai-spec.md`](../ai-spec.md)
2. This feature specification

This feature is **infrastructure**, not user-facing. It defines the four Mongoose models
that every backend API feature reads from and writes to. It depends on the
**Backend Configuration** feature (the live MongoDB connection) and is depended on by the
Session, User, Post, and Comment API features.

> **Source of truth:** the field set below is the project's agreed schema. It draws on the
> `BACKEND SCHEMAS` tasks in `Working/module9-jira-tasks.csv`, `ai-spec.md` →
> *Database Collections*, and `Working/MOD 9.md`, with team-decided overrides. Where these
> tables differ from those source documents, the differences are recorded in
> `Working/Issues.md` (Issues 3–8).

---

## Feature Identity

- **Feature Name:** Backend Schemas (Mongoose Models)
- **Related Area:** Backend

---

## Feature Goal

Define the four MongoDB collections as Mongoose models so the backend has a single,
consistent data layer:

- **User** — accounts and profile data.
- **Session** — cookie-based session records.
- **Post** — blog posts (with their comments).
- **Comment** — comments on posts.

When this feature is done, importing any model creates/uses the correct collection, fields
are typed and validated, relationships between collections use `ObjectId` references, and
all four collections appear in MongoDB on first use.

---

## Feature Scope

### In Scope (Included)

- `server/models/User.js` — User schema + model.
- `server/models/Session.js` — Session schema + model.
- `server/models/Post.js` — Post schema + model.
- `server/models/Comment.js` — Comment schema + model.
- Field types, `required` flags, defaults, uniqueness, and `ref` relationships for each.
- snake_case field names matching the API contract (`first_name`, `last_name`, `auth_level`,
  `user_id`, `post_id`).

### Out of Scope (Excluded)

- Password **hashing logic** — bcrypt hashing happens in the User API controller, not in
  the schema. ⚠️ Do not add a pre-save hash hook here unless a later feature requires it;
  the User API feature owns hashing.
- Session **id generation / expiry checking** — owned by the Session API feature.
- Any controllers, routes, or endpoints.
- Validation beyond schema-level type/required/unique (e.g. email-format regex, password
  strength) — those live in the relevant API feature.
- Seed data and the Postman collection.

---

## Sub-Requirements (Feature Breakdown)

- **User schema** — `first_name`, `last_name`, `email` (unique), `password`, `birthday`,
  `location`, `occupation`, `status` (Boolean), `auth_level` (default `"basic"`).
- **Session schema** — `session_id` (String), `session_date` (Date), `user` (ref User).
  (`_id` is the default Mongo ObjectId.)
- **Post schema** — `title`, `content`, `user_id` (ref User), `likes` (Number), `time_stamp` (String),
  `comments` (array of Comment refs). (`_id` is the default Mongo ObjectId.)
- **Comment schema** — `content`, `post_id` (ref Post), `user_id` (ref User), `likes`
  (Number), `time_stamp` (String). (`_id` is the default Mongo ObjectId.)
- **Collections verified** — starting the server and creating one of each document makes the
  `users`, `sessions`, `posts`, and `comments` collections appear in MongoDB.

---

## User Flow / Logic (High Level)

No end-user flow; the "actor" is the backend at runtime.

1. The Configuration feature has already opened the MongoDB connection.
2. An API controller imports a model (e.g. `const User = require("../models/User")`).
3. On the first write, Mongoose creates the collection from the schema.
4. Reads/writes are typed and validated against the schema; references link documents
   across collections.

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

None. Backend-only.

### Backend / API

No endpoints. These models are imported by the controllers added in later features:

- `User`    → User API (`/user`) and Session API (`/session`)
- `Session` → Session API (`/session`)
- `Post`    → Post API (`/posts`)
- `Comment` → Comment API (`/comments`)

---

## Data Used or Modified

### User — collection `users`

| Field | Type | Required | Default | Notes |
| ----- | ---- | -------- | ------- | ----- |
| `first_name` | String | yes | — | |
| `last_name`  | String | yes | — | |
| `email`      | String | yes | — | **unique** |
| `password`   | String | yes | — | stored as a bcrypt hash (hashing done in User API); ⚠️ never returned in responses |
| `birthday`   | Date   | yes | — | |
| `location`   | String | no  | — | profile info from Registration wireframe |
| `occupation` | String | no  | — | profile info from Registration wireframe |
| `status`     | Boolean | no | `true` | account active flag (`true` = active, `false` = inactive/suspended) |
| `auth_level` | String | yes | `"basic"` | `"basic"` \| `"admin"`; ⚠️ never settable by the client |

### Session — collection `sessions`

| Field | Type | Required | Default | Notes |
| ----- | ---- | -------- | ------- | ----- |
| `_id`          | ObjectId | auto | Mongo-generated | default document id |
| `session_id`   | String   | yes  | — | session identifier stored in the cookie (the value the browser sends back) |
| `session_date` | Date     | no   | `Date.now` | when the session was created; expiration is derived from this in the Session API |
| `user`         | ObjectId (ref `User`) | yes | — | the authenticated user |

### Post — collection `posts`

| Field | Type | Required | Default | Notes |
| ----- | ---- | -------- | ------- | ----- |
| `_id`        | ObjectId | auto | Mongo-generated | default document id |
| `title`      | String   | yes  | — | post title (from Post Modal wireframe) |
| `content`    | String   | yes  | — | post body |
| `user_id`    | ObjectId (ref `User`) | yes | — | author |
| `likes`      | Number   | no   | `0` | like count |
| `time_stamp` | String   | yes  | — | when the post was created (stored as a String) |
| `comments`   | [ObjectId] (ref `Comment`) | no | `[]` | comments belonging to this post |

### Comment — collection `comments`

| Field | Type | Required | Default | Notes |
| ----- | ---- | -------- | ------- | ----- |
| `_id`        | ObjectId | auto | Mongo-generated | default document id |
| `content`    | String   | yes  | — | comment text |
| `post_id`    | ObjectId (ref `Post`) | yes | — | post being commented on |
| `user_id`    | ObjectId (ref `User`) | yes | — | commenter |
| `likes`      | Number   | no   | `0` | like count |
| `time_stamp` | String   | yes  | — | when the comment was created (stored as a String) |

### Relationships

- `Session.user` → `User`
- `Post.user_id` → `User`, `Post.comments[]` → `Comment`
- `Comment.user_id` → `User`, `Comment.post_id` → `Post`

> Note: Post ↔ Comment is linked from both sides (`Post.comments[]` and `Comment.post_id`).
> Controllers must keep both in sync when a comment is created. This is a team decision
> recorded in `Working/Issues.md` (Issue 8).

---

## Tech Constraints (Feature-Level)

- Mongoose only; use `mongoose.Schema` and `mongoose.model`.
- snake_case field names exactly as tabled above.
- `auth_level` default is `"basic"`; the client may never set it (enforced in the API).
- `User.status` is a **Boolean** (default `true`).
- Session uses `session_id` (cookie value) + `session_date` + `user`; no stored `expiry`
  (expiration derived from `session_date` in the Session API).
- `Post` and `Comment` both use `time_stamp` as a **String**; `Post.comments` is an array of
  `Comment` refs.
- Password is a plain `String` field here; **bcrypt hashing is the User API's job**, not the
  schema's.
- Follow the repo structure in `ai-spec.md`: models live in `server/models/`.
- Add clear inline comments and mark every known limitation with `// ⚠️`.

> ⚠️ Several fields in these tables intentionally diverge from `ai-spec.md`,
> `wireframe-analysis.md`, and the CSV (e.g. `User.status` type, the Session fields, and the
> Post/Comment fields). Every divergence is logged in `Working/Issues.md` (Issues 3–8).

---

## Acceptance Criteria

- [ ] `models/User.js`, `Session.js`, `Post.js`, `Comment.js` each define a schema and export a model.
- [ ] All fields, types, `required` flags, defaults, and `unique` constraints match the tables above.
- [ ] `email` is unique; `auth_level` defaults to `"basic"`; `status` is a Boolean defaulting to `true`; `likes` defaults to `0`.
- [ ] Session has `session_id`, `session_date`, and a `user` ref (no `expiry` field).
- [ ] Post has `title`, `content`, `user_id` ref, `likes`, `time_stamp` (String), and a `comments` array of Comment refs.
- [ ] Comment has `content`, `post_id` ref, `user_id` ref, `likes`, and `time_stamp` (String).
- [ ] Relationship fields use `mongoose.Schema.Types.ObjectId` with the correct `ref`.
- [ ] No bcrypt logic, session-id logic, validation regex, controllers, or routes were added here.
- [ ] Starting the server and creating one document of each type produces the `users`, `sessions`, `posts`, and `comments` collections in MongoDB.
- [ ] No console or lint errors; ready to merge into `dev` from a `feature/schemas` branch.

---

## Notes for the AI

- This feature is data **shape only** — define structure, not behavior.
- Do **not** hash passwords or generate session ids here; the Session/User API features own that.
- Keep models small and readable; one schema + one `mongoose.model` export per file.
- Reuse the exact field names above so later controllers map request/response bodies 1:1.
- The schema in these tables is authoritative for this project even where it differs from the
  source specs; those differences are recorded in `Working/Issues.md` (Issues 3–8).
