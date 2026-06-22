# 🤖 AI_FEATURE_Backend-Post-Endpoint

This document describes **one feature of the CodeBloggs project**: the `/posts` API endpoints.

It must be read together with:

1. The global AI specification — [`ai/ai-spec.md`](../ai-spec.md)
2. This feature specification

**Source of truth:** `Working/Module_9/FSD Grading Sheets (Shared) - m9.csv` — Sub-Section
"Feature - Backend /posts endpoints".

Supporting references: `wireframe-analysis.md` (Home wireframe, Bloggs wireframe, Post
Modal wireframe) and `Working/MOD 9.md`.

This feature depends on:
- **Backend Configuration** — server running, `/posts` router mounted
- **Backend Schemas** — `Post` model (`content`, `user_id`, `likes`, `time_stamp`, `comments`)

> ⚠️ Post schema fields diverge from the wireframe analysis in two ways (see
> `Working/Issues.md`, Issues 5 and 7): `liked_by` is dropped and `time_stamp` is a String
> (not a Date). `title` has been restored. These tables are authoritative.

---

## Feature Identity

- **Feature Name:** Post API (Create / Update / Get All)
- **Related Area:** Backend

---

## Feature Goal

Allow authenticated users to create posts and retrieve the full post feed. Support liking
a post by updating its like count. Posts power the Home page (user's own posts), the Bloggs
page (all posts newest first), and the Post Modal (create).

---

## Feature Scope

### In Scope (Included)

- `POST /posts` — create a new post.
- `PATCH /posts/:id` — update a post by ID (used for incrementing likes).
- `GET /posts` — retrieve all posts.
- `server/controllers/post.controller.js` — all three handler functions.
- `server/routes/post.routes.js` — route definitions linking path + HTTP method + controller.

### Out of Scope (Excluded)

- Delete post — not required for this module.
- Author-filter query param — `GET /posts` returns all posts; frontend filters client-side.
- Per-user like de-duplication — `liked_by` was dropped from the schema (Issue 5).
- Any frontend code.

---

## Sub-Requirements (Feature Breakdown)

- **Create post** — accept `title`, `content`, `user_id`, and `time_stamp` from the request
  body, set `likes` to `0` and `comments` to `[]`, save Post document, return created post.
- **Update post by ID** — find Post by `_id`, apply partial update (primarily `likes`),
  return updated post. Return `404` if not found.
- **Get all posts** — return all Post documents. Return empty array if none exist.

---

## User Flow / Logic (High Level)

### Create Post

1. Client sends `POST /posts` with `{ title, content, user_id, time_stamp }`.
2. Create Post with `likes: 0` and `comments: []` forced server-side.
3. Return `201` with the created post.

### Update Post by ID

1. Client sends `PATCH /posts/:id` with fields to update (e.g. `{ likes: 5 }`).
2. Find Post by `_id`. Not found → `404`.
3. Apply update with `{ new: true }` to return the updated document.
4. Return `200` with the updated post.

### Get All Posts

1. Client sends `GET /posts`.
2. Find all Posts.
3. Return `200` with array of posts. Empty array if none exist.

> The frontend sorts posts newest-first by `time_stamp` client-side. The API returns
> posts unsorted.

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

None. The frontend calls these routes; it does not define them.

### Backend / API

| Method | Route | Purpose |
| ------ | ----- | ------- |
| `POST` | `/posts` | Create a new post |
| `PATCH` | `/posts/:id` | Update a post by ID (likes) |
| `GET` | `/posts` | Get all posts |

#### POST /posts

**Body parameters**

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| `title` | String | yes | Post title |
| `content` | String | yes | Post body text |
| `user_id` | String | yes | MongoDB `_id` of the author |
| `time_stamp` | String | yes | When the post was created (String) |

**Sample request**
```json
{
  "title": "My first post",
  "content": "Hello CodeBloggs! Excited to be here.",
  "user_id": "user-001",
  "time_stamp": "2026-06-15T14:30:00Z"
}
```

**Sample response — 201**
```json
{
  "status": "ok",
  "data": {
    "post": {
      "_id": "post-101",
      "title": "My first post",
      "content": "Hello CodeBloggs! Excited to be here.",
      "user_id": "user-001",
      "likes": 0,
      "time_stamp": "2026-06-15T14:30:00Z",
      "comments": []
    }
  },
  "message": "Post created successfully"
}
```

#### PATCH /posts/:id

**Path parameter**

| Name | Type | Description |
| ---- | ---- | ----------- |
| `id` | String | MongoDB `_id` of the post |

**Body parameters** (partial update — send only what needs to change)

| Name | Type | Description |
| ---- | ---- | ----------- |
| `likes` | Number | Updated like count |

**Sample request**
```json
{ "likes": 5 }
```

**Sample response — 200**
```json
{
  "status": "ok",
  "data": {
    "post": {
      "_id": "post-101",
      "title": "My first post",
      "content": "Hello CodeBloggs! Excited to be here.",
      "user_id": "user-001",
      "likes": 5,
      "time_stamp": "2026-06-15T14:30:00Z",
      "comments": ["comment-1"]
    }
  },
  "message": "Post updated successfully"
}
```

**Sample response — 404**
```json
{ "status": "error", "data": {}, "message": "Post not found" }
```

#### GET /posts

**Sample response — 200**
```json
{
  "status": "ok",
  "data": {
    "posts": [
      {
        "_id": "post-101",
        "title": "My first post",
        "content": "Hello CodeBloggs! Excited to be here.",
        "user_id": "user-001",
        "likes": 5,
        "time_stamp": "2026-06-15T14:30:00Z",
        "comments": ["comment-1"]
      }
    ]
  },
  "message": "Posts retrieved successfully"
}
```

---

## Data Used or Modified

- **Creates:** `Post` document (`likes` and `comments` always server-set to defaults)
- **Updates:** `Post` by `_id` (partial — primarily `likes`)
- **Reads:** all `Post` documents
- **Also modified:** `Post.comments[]` is updated by the Comment API when a comment is
  created (two-way link — see `Working/Issues.md`, Issue 8)

---

## Tech Constraints (Feature-Level)

- `likes` must default to `0` server-side on create. Do not accept it from the request body.
- `comments` must default to `[]` server-side on create. Do not accept it from the request body.
- Use `findByIdAndUpdate` with `{ new: true }` so the updated document is returned.
- ⚠️ `time_stamp` is a **String**, not a Date — store exactly as received from the client.
- All responses follow `{ status, data, message }` per `ai-spec.md`.
- Files: `server/controllers/post.controller.js` and `server/routes/post.routes.js`.

---

## Acceptance Criteria

Grading checklist (from `FSD Grading Sheets (Shared) - m9.csv`):

- [ ] **Post Endpoint — Post Create:** a route creates a new post.
- [ ] **Post Endpoint — Update Post by ID:** a route updates a post by its ID.
- [ ] **Post Endpoint — Get All Posts:** a route retrieves all posts.

Additional verification:

- [ ] `POST /posts` saves the post with `likes: 0` and `comments: []` regardless of request body.
- [ ] `POST /posts` returns the created post.
- [ ] `PATCH /posts/:id` with a valid ID returns the updated post.
- [ ] `PATCH /posts/:id` with an unknown ID returns `404`.
- [ ] `GET /posts` returns all posts (empty array if none).
- [ ] All responses use `{ status, data, message }` shape.
- [ ] Postman collection covers all three endpoints (happy path + error cases).
- [ ] No console or lint errors; ready to merge into `dev` from `feature/post-api`.

---

## Notes for the AI

- Add a `// ⚠️` comment noting that `time_stamp` is a String — do not coerce it to a Date.
- `Post.comments[]` is updated by the Comment API (not here) — do not add comment-push logic
  to post creation.
- Keep changes scoped to `post.controller.js` and `post.routes.js` only.
- Do not modify the Post schema — it is owned by the Schemas feature.
