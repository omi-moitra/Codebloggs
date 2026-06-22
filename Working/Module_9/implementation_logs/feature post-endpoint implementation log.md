# Feature Post API (Create / Update / Get All) Implementation Log

## Files Created

- `server/controllers/post.controller.js`
- `Working/Module_9/implementation_logs/feature post-endpoint implementation log.md`

## Files Modified

- `server/routes/post.routes.js` — wired the three routes to controller handlers.
- `server/schemas/Post.js` — added the `title` field (see Decisions / Issues below).
- `Working/Issues.md` — Issue 5 updated to record `title` restored.

## What Was Built

The `/posts` endpoints powering Home, Bloggs, and the Post Modal:

- **POST /posts (create)** — accepts `title`, `content`, `user_id`, `time_stamp`; forces
  `likes: 0` and `comments: []` server-side (never read from the body); stores `time_stamp` as
  a String exactly as received; returns the created post (`201`).
- **PATCH /posts/:id (update)** — `findByIdAndUpdate(id, body, { new: true, runValidators: true })`
  for a partial update (primarily `likes`); `404` if not found or malformed id; returns the
  updated post (`200`).
- **GET /posts (get all)** — `find()`; returns an array (empty if none); unsorted (frontend
  sorts newest-first).

All responses use the `{ status, data, message }` contract.

## Grading Checklist (FSD Grading Sheets — m9.csv, "Feature - Backend /posts endpoints")

- [x] **Post Endpoint - Post Create** — `POST /posts` creates a post.
- [x] **Post Endpoint - Update Post by ID** — `PATCH /posts/:id` updates a post.
- [x] **Post Endpoint - Get All Posts** — `GET /posts` retrieves all posts.
- [ ] **Postman collection** — NOT created this session (consistent with prior endpoint
      features deferring Postman). Outstanding grading item; must cover all three endpoints
      (happy path + 404 error case) before submission.

## Key Decisions

- **`title` added to the Post schema** — the post-endpoint feature spec requires `title`
  (required body param, in every sample) and states it is authoritative/restored, but the
  schema (and Issues.md Issue 5) had dropped it, while the spec also says "do not modify the
  Post schema." This was a blocking contradiction; **user chose to add `title` to the schema.**
  `title` is `String, required: true`. Issue 5 updated to reflect the restoration; `liked_by`
  remains dropped.
- `likes` (0) and `comments` ([]) are forced server-side on create — never read from the body.
- `time_stamp` stored as a String, not coerced to a Date (Issue 7).
- `PATCH` uses `{ new: true }` (returns updated doc) + `runValidators: true` (keeps types valid
  on partial update). Malformed id → `404`; schema validation failure → `400`.
- Create maps `ValidationError`/`CastError` → `400 "Invalid post data"` instead of a 500.
- Route order: `GET /posts` before `PATCH /posts/:id` (param route last). ESM imports; `Post`
  imported from `server/schemas/`.

## Issues Flagged

- **Resolved during this feature (Issue 5):** `title` schema/spec contradiction — decided with
  the user to add `title` to the schema; Issues.md Issue 5 updated accordingly. No other new
  conflicts found.

Operational notes:
1. **Postman collection** deferred (see checklist).
2. **Branch name** is `feature/post-api`, which matches the feature spec — no discrepancy.
3. ⚠️ **Schema change ripple:** because `title` is now `required`, any other code path that
   creates a Post without a `title` will fail validation. The Post Modal (frontend) and any
   seed data must send `title`.

## Intentionally Not Implemented (out of scope)

- Delete post; author-filter query param (frontend filters client-side).
- Per-user like de-duplication (`liked_by` dropped, Issue 5).
- Comment-push into `Post.comments[]` — owned by the Comment API (Issue 8); not added here.
- Any frontend code.

## Verification Results

- `node --check` passed for `post.controller.js`, `post.routes.js`, and `schemas/Post.js`.
- Loaded the router via Node ESM: three routes register — `POST /posts`, `GET /posts`,
  `PATCH /posts/:id` (collection routes before the param route).
- Confirmed the Post schema now exposes `title` alongside the existing fields.
- No live MongoDB integration run this session (requires a reachable `MONGO_URI`). Recommend a
  Postman/curl pass: create → get-all → patch likes → patch unknown-id (404).
- The CLIENT folder was not touched, per instructions.
