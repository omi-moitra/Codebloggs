# Issues — Spec Discrepancies to Reconcile

Conflicts found between source documents while writing the backend feature specs. Each
needs a team decision so all backend specs, code, and the Postman collection stay consistent.

| # | Issue | Source A | Source B | Decision | Status |
|---|-------|----------|----------|----------|--------|
| 1 | User route base path: singular vs plural | `wireframe-analysis.md` (signed-off contract) uses **`/user`** | `module9-jira-tasks.csv` uses **`/users`** | **`/user`** | ✅ Resolved (2026-06-15) |
| 2 | Backend DB folder name | `ai-spec.md` repo structure uses **`/server/db`** | `module9-jira-tasks.csv` task text says **`database/`** | **`/server/db`** | ✅ Resolved (2026-06-15) |
| 3 | `User.status` type | `MOD 9.md` sample shows a free-text String sentence | `module9-jira-tasks.csv` allows "String or Boolean" | **Boolean** (default `true`) | ✅ Resolved (2026-06-15) |
| 4 | Session schema fields | `module9-jira-tasks.csv`: `user_id`, `token`, `created_at`, `expiry` | Team-directed | **`session_id`, `session_date`, `user`** (no `expiry`) | ✅ Resolved (2026-06-15) |
| 5 | Post schema fields | CSV / older notes: `title`, `post_date` (Date), `liked_by` | Current backend schema/controller + clarified Module 9 requirement | **`content`, `user_id`, `likes`, `time_stamp` (String), `comments[]`** — no stored `title`; modal title/header is UI-only; `liked_by` dropped | ✅ Resolved (2026-06-15, updated 2026-06-16) |
| 6 | Comment schema fields | CSV / `wireframe-analysis.md`: `date` (Date), no likes | Team-directed | **`content`, `post_id`, `user_id`, `likes`, `time_stamp` (String)** | ✅ Resolved (2026-06-15) |
| 7 | Timestamp naming/type | `wireframe-analysis.md` returns `post_date` / `date` (ISO strings) | Schema feature | **`time_stamp` (String) on Post & Comment** | ✅ Resolved (2026-06-15) |
| 8 | Post ↔ Comment link direction | Spec links comments via `Comment.post_id` only | Team-directed | **Linked both ways** (`Post.comments[]` + `Comment.post_id`) | ✅ Resolved (2026-06-15) |
| 9 | `POST /posts` sample request ownership | Older notes sent `title`, `user_id`, and `time_stamp` from the client | Current controller derives `user_id` and `time_stamp` from the session/server | Client sends **`content` only**; modal title/header is UI-only | ✅ Resolved (2026-06-16) |
| 10 | `POST /comments` sample request ownership | Older notes sent `user_id` and `time_stamp` from the client | Current controller derives `user_id` and `time_stamp` from the session/server | Client sends **`post_id` + `content` only** | ✅ Resolved (2026-06-16) |
| 11 | `PATCH /posts/:id` — `liked_by` in wireframe body but absent from Post schema | `wireframe-analysis.md` defines `liked_by` (array of user IDs) as a body field on the like action | Issue 5 explicitly dropped `liked_by` from the Post schema | **Client-side de-duplication** — frontend tracks liked post IDs in localStorage; schema unchanged; `liked_by` removed from PATCH body and `PostmanCollection.json` | ✅ Resolved (2026-06-16) |

---

## Issue 1 — `/user` vs `/users`

- **Where it bites:** route mounting in `server.js`, all User API endpoints, the frontend
  fetch calls, and `PostmanCollection.json`.
- **Decision needed:** pick one path and apply it everywhere.
- **Decision (2026-06-15):** use **`/user`** (singular), per `wireframe-analysis.md`. All
  backend specs, code, and `PostmanCollection.json` must use `/user`. The CSV's `/users`
  wording is superseded.

## Issue 2 — `/server/db` vs `database/`

- **Where it bites:** location of `connection.js` and its import path in `server.js`.
- **Decision needed:** confirm the folder name for the DB connection module.
- **Decision (2026-06-15):** use **`/server/db/connection.js`**, per `ai-spec.md` (the
  primary specification every AI prompt must follow). The CSV's `database/` wording is
  superseded.

---

> Issues 3–8 are **team-directed schema overrides** captured while writing
> `ai/features/schemas.feature.md`. They take precedence over the source documents for this
> project; recorded here so they can be reconciled later if needed.

## Issue 3 — `User.status` type

- **Where it bites:** User schema, User/Session API responses, Network/Admin status display.
- **Decision (2026-06-15):** `status` is a **Boolean** (default `true`; `true` = active,
  `false` = inactive/suspended). The `MOD 9.md` free-text sentence is superseded; the API
  must not return a status sentence.

## Issue 4 — Session schema fields

- **Where it bites:** Session schema, Session API (login/logout/validate), the cookie value.
- **Decision (2026-06-15):** Session = `_id`, **`session_id`** (String, the cookie value),
  **`session_date`** (Date), **`user`** (ref User). The CSV's `token`/`created_at`/`expiry`
  are superseded. ⚠️ There is **no `expiry` field** — the Session API must derive expiration
  from `session_date` + a fixed TTL.

## Issue 5 — Post schema fields

- **Where it bites:** Post schema, Post API, Post Modal, Home/Bloggs rendering.
- **Decision (2026-06-15, updated 2026-06-16):** Post = `_id`, **`content`**,
  **`user_id`** (ref User), **`likes`** (Number), **`time_stamp`** (String), **`comments`**
  (array of Comment refs).
- `title` is **not stored** in the current backend schema. The Post Modal title/header is
  UI text only and must not be sent as a database field unless the backend schema later
  adds it.
- ⚠️ **`liked_by` dropped** — per-user like de-duplication is no longer enforced at the
  schema level.

## Issue 6 — Comment schema fields

- **Where it bites:** Comment schema, Comment API, comment rendering under posts.
- **Decision (2026-06-15):** Comment = `_id`, **`content`**, **`post_id`** (ref Post),
  **`user_id`** (ref User), **`likes`** (Number), **`time_stamp`** (String). The spec's
  `date` (Date) is superseded and a `likes` field is added.

## Issue 7 — Timestamp naming/type

- **Where it bites:** all Post/Comment API responses and any frontend that reads timestamps.
- **Decision (2026-06-15):** use **`time_stamp` (String)** on Post and Comment. ⚠️ Frontend
  code in `wireframe-analysis.md` that reads `post_date` / `date` must be updated to read
  `time_stamp`.

## Issue 8 — Post ↔ Comment link direction

- **Where it bites:** Comment API create flow.
- **Decision (2026-06-15):** comments are linked from **both** sides — `Post.comments[]` and
  `Comment.post_id`. Controllers must keep both in sync when a comment is created (redundant
  vs. the spec's single `post_id` link).

---

> Issues 9–11 were surfaced during the **Postman collection audit (2026-06-16)** — a
> field-by-field comparison of `wireframe-analysis.md` against the Mongoose schemas and
> controllers.

## Issue 9 — `POST /posts` client payload ownership

- **Where it bites:** `PostmanCollection.json` Create Post request body; any frontend
  implementation that follows the wireframe sample verbatim.
- **The gap:** Older notes expected a title field or client-supplied ownership/timestamp
  fields. The current controller creates posts from the authenticated session and server
  clock, so the client must not treat those fields as required inputs.
- **Current request:**
  ```json
  { "content": "Hello CodeBloggs! Excited to be here." }
  ```
- **Decision:** `content` is the only required post body field from the frontend. The backend
  sets `user_id`, `time_stamp`, `likes`, and `comments`.

## Issue 10 — `POST /comments` client payload ownership

- **Where it bites:** `PostmanCollection.json` Create Comment request body; any frontend
  implementation that follows the wireframe sample verbatim.
- **The gap:** Older notes treated `user_id` and `time_stamp` as client-supplied required
  fields. The current controller derives both from the session/server.
- **Current request:**
  ```json
  { "post_id": "post-101", "content": "Great first post!" }
  ```
- **Decision:** `post_id` and `content` are the only required comment body fields from the
  frontend. The backend sets `user_id`, `time_stamp`, and `likes`, and syncs the parent
  `Post.comments[]` reference.

## Issue 11 — `PATCH /posts/:id` — `liked_by` defined in wireframe but absent from Post schema

- **Where it bites:** every like action on the frontend; `PostmanCollection.json`; any
  de-duplication logic that checks whether a user has already liked a post.
- **The gap:** `wireframe-analysis.md` → Home → Action A (like a post) defines the
  `PATCH /posts/:id` request body as:
  ```json
  { "likes": 5, "liked_by": ["user-014", "user-020", "user-001"] }
  ```
  Issue 5 (resolved 2026-06-15) explicitly dropped `liked_by` from the Post schema. The
  current Post schema (`schemas/Post.js`) has only `likes: Number`. Mongoose operates in
  strict mode by default, so any `liked_by` value sent in the PATCH body is silently
  stripped — it never persists, and no error is returned.
- **Decision (2026-06-16):** **Client-side de-duplication. Schema unchanged.**
  - The Post schema stays as-is (`likes: Number` only). No backend changes required.
  - The frontend tracks which post IDs the logged-in user has already liked in
    **`localStorage`** (keyed by user ID so it survives page refresh but stays per-browser).
  - On clicking Like: read `localStorage`, if the post ID is already in the liked set →
    decrement `likes` and remove the ID; otherwise → increment `likes` and add the ID. Send
    only `{ "likes": <new_count> }` in the PATCH body.
  - `liked_by` has been removed from `PostmanCollection.json` — the PATCH body now sends
    `likes` only, matching what the server actually stores.
  - ⚠️ `wireframe-analysis.md` → Home → Action A sample request should be updated to remove
    `liked_by` and reflect `{ "likes": <count> }` only.

---

_Referenced inline with `// ⚠️` in
[`ai/features/configuration.feature.md`](../ai/features/configuration.feature.md) and
[`ai/features/schemas.feature.md`](../ai/features/schemas.feature.md)._
