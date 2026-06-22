# 🤖 AI_FEATURE_Backend-Comment-Endpoint

This document describes **one feature of the CodeBloggs project**: the `/comments` API endpoints.

It must be read together with:

1. The global AI specification — [`ai/ai-spec.md`](../ai-spec.md)
2. This feature specification

**Source of truth:** `Working/Module_9/FSD Grading Sheets (Shared) - m9.csv` — Sub-Section
"Feature - Backend /comments endpoints".

Supporting references: `wireframe-analysis.md` (Home wireframe — Add a comment action)
and `Working/MOD 9.md` (lines 1410, 1415).

This feature depends on:
- **Backend Configuration** — server running, `/comments` router mounted
- **Backend Schemas** — `Comment` model (`content`, `post_id`, `user_id`, `likes`, `time_stamp`)
  and `Post` model (for the two-way `comments[]` link)

> ⚠️ Comment creates must keep both sides of the Post ↔ Comment link in sync: push the new
> `comment._id` into `Post.comments[]` after saving the Comment document.
> See `Working/Issues.md`, Issue 8.

---

## Feature Identity

- **Feature Name:** Comment API (Create / Update / Get All)
- **Related Area:** Backend

---

## Feature Goal

Allow authenticated users to add comments to posts, update existing comments, and retrieve
all comments. Comments are displayed under each post on the Home and Bloggs pages.

---

## Feature Scope

### In Scope (Included)

- `POST /comments` — create a new comment and push its `_id` into the parent post's `comments[]`.
- `PATCH /comments/:id` — update a comment by ID (content and/or likes).
- `GET /comments` — retrieve all comments.
- `server/controllers/comment.controller.js` — all three handler functions.
- `server/routes/comment.routes.js` — route definitions linking path + HTTP method + controller.

### Out of Scope (Excluded)

- Delete comment — not required for this module.
- Filtering comments by `post_id` — `GET /comments` returns all comments; the frontend
  groups them by `post_id` client-side.
- Any frontend code.

---

## Sub-Requirements (Feature Breakdown)

- **Create comment** — accept `content`, `post_id`, `user_id`, and `time_stamp` from the
  request body, set `likes` to `0`, save Comment document, push `comment._id` into
  `Post.comments[]`, return the created comment.
- **Update comment by ID** — find Comment by `_id`, update `content`, return the updated
  comment. Return `404` if not found.
- **Get all comments** — return all Comment documents. Return empty array if none exist.

---

## User Flow / Logic (High Level)

### Create Comment

1. Client sends `POST /comments` with `{ content, post_id, user_id, time_stamp }`.
2. Verify the parent Post exists by `post_id`. Not found → `404` (do not save the Comment).
3. Create Comment with `likes: 0` forced server-side.
4. Save Comment document.
5. Push `comment._id` into `Post.comments[]` using `$push`.
6. Return `201` with the created comment.

### Update Comment by ID

1. Client sends `PATCH /comments/:id` with `{ content }` and/or `{ likes }` in the body.
2. Find Comment by `_id`. Not found → `404`.
3. Update `content` with `{ new: true }` to return the updated document.
4. Return `200` with the updated comment.

### Get All Comments

1. Client sends `GET /comments`.
2. Find all Comments.
3. Return `200` with array of comments. Empty array if none exist.

> The frontend groups comments by `post_id` client-side when rendering post comment lists.

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

None. The frontend calls these routes; it does not define them.

### Backend / API

| Method | Route | Purpose |
| ------ | ----- | ------- |
| `POST` | `/comments` | Create a new comment |
| `PATCH` | `/comments/:id` | Update a comment by ID |
| `GET` | `/comments` | Get all comments |

#### POST /comments

**Body parameters**

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| `content` | String | yes | Comment text |
| `post_id` | String | yes | MongoDB `_id` of the post being commented on |
| `user_id` | String | yes | MongoDB `_id` of the commenter |
| `time_stamp` | String | yes | When the comment was created (String) |

**Sample request**
```json
{
  "content": "Great first post!",
  "post_id": "post-101",
  "user_id": "user-001",
  "time_stamp": "2026-06-15T16:10:00Z"
}
```

**Sample response — 201**
```json
{
  "status": "ok",
  "data": {
    "comment": {
      "_id": "comment-1",
      "content": "Great first post!",
      "post_id": "post-101",
      "user_id": "user-001",
      "likes": 0,
      "time_stamp": "2026-06-15T16:10:00Z"
    }
  },
  "message": "Comment added successfully"
}
```

**Sample response — 404 (post not found)**
```json
{ "status": "error", "data": {}, "message": "Post not found" }
```

#### PATCH /comments/:id

**Path parameter**

| Name | Type | Description |
| ---- | ---- | ----------- |
| `id` | String | MongoDB `_id` of the comment |

**Body parameters**

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| `content` | String | yes | Updated comment text |

**Sample request**
```json
{ "content": "Updated comment text." }
```

**Sample response — 200**
```json
{
  "status": "ok",
  "data": {
    "comment": {
      "_id": "comment-1",
      "content": "Updated comment text.",
      "post_id": "post-101",
      "user_id": "user-001",
      "likes": 0,
      "time_stamp": "2026-06-15T16:10:00Z"
    }
  },
  "message": "Comment updated successfully"
}
```

**Sample response — 404**
```json
{ "status": "error", "data": {}, "message": "Comment not found" }
```

#### GET /comments

**Sample response — 200**
```json
{
  "status": "ok",
  "data": {
    "comments": [
      {
        "_id": "comment-1",
        "content": "Great first post!",
        "post_id": "post-101",
        "user_id": "user-001",
        "likes": 0,
        "time_stamp": "2026-06-15T16:10:00Z"
      }
    ]
  },
  "message": "Comments retrieved successfully"
}
```

---

## Data Used or Modified

- **Creates:** `Comment` document (`likes` always set to `0` server-side)
- **Updates:** `Post.comments[]` — new `comment._id` pushed on Comment create (two-way link, Issue 8)
- **Updates:** `Comment` by `_id` (content only)
- **Reads:** all `Comment` documents

---

## Tech Constraints (Feature-Level)

- `likes` must default to `0` server-side on create. Do not accept it from the request body.
- ⚠️ On Comment create, **also update the parent Post**: `Post.findByIdAndUpdate(post_id, { $push: { comments: comment._id } })`. Verify the Post exists before saving the Comment — if the Post is not found, return `404` and abort.
- ⚠️ `time_stamp` is a **String** — store exactly as received from the client; do not coerce to a Date.
- Only `content` and `likes` are updatable via `PATCH /comments/:id`. Do not allow updating `post_id`,
  `user_id`, `likes`, or `time_stamp`.
- Use `findByIdAndUpdate` with `{ new: true }` on update so the updated document is returned.
- All responses follow `{ status, data, message }` per `ai-spec.md`.
- Files: `server/controllers/comment.controller.js` and `server/routes/comment.routes.js`.

---

## Acceptance Criteria

Grading checklist (from `FSD Grading Sheets (Shared) - m9.csv`):

- [ ] **Comment Endpoint — Comment Create:** a route creates a new comment.
- [ ] **Comment Endpoint — Update Comment by ID:** a route updates a comment by its ID.
- [ ] **Comment Endpoint — Get All Comments:** a route retrieves all comments.

Additional verification:

- [ ] `POST /comments` saves the comment with `likes: 0` and pushes `comment._id` into `Post.comments[]`.
- [ ] `POST /comments` with an unknown `post_id` returns `404`.
- [ ] `POST /comments` returns the created comment.
- [ ] `PATCH /comments/:id` with a valid ID returns the updated comment.
- [ ] `PATCH /comments/:id` with an unknown ID returns `404`.
- [ ] `GET /comments` returns all comments (empty array if none).
- [ ] All responses use `{ status, data, message }` shape.
- [ ] Postman collection covers all three endpoints (happy path + error cases).
- [ ] No console or lint errors; ready to merge into `dev` from `feature/comment-api`.

---

## Notes for the AI

- Add a `// ⚠️` comment on the two-step Comment create (save Comment + push to Post)
  explaining the two-way link and why both operations are needed (Issue 8).
- Add a `// ⚠️` comment noting that `time_stamp` is a String — do not coerce it to a Date.
- Only `content` and `likes` should be updatable via `PATCH /comments/:id`.
- Keep changes scoped to `comment.controller.js` and `comment.routes.js` only.
- Do not modify the Comment or Post schemas — they are owned by the Schemas feature.
