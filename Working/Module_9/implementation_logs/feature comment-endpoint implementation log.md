# Feature Comment API (Create / Update / Get All) Implementation Log

## Files Created

- `server/controllers/comment.controller.js`
- `Working/Module_9/implementation_logs/feature comment-endpoint implementation log.md`

## Files Modified

- `server/routes/comment.routes.js` — wired the three routes to controller handlers.

## What Was Built

The `/comments` endpoints for the comment lists under posts on Home and Bloggs:

- **POST /comments (create)** — verifies the parent `Post` exists by `post_id` (`404` and
  abort if not), creates the `Comment` with `likes: 0` forced server-side, stores `time_stamp`
  as a String as-received, then `$push`es `comment._id` into `Post.comments[]` to keep both
  sides of the link in sync (Issue 8). Returns the created comment (`201`).
- **PATCH /comments/:id (update)** — updates **`content` and/or `likes` only** (ignores `post_id`, `user_id`,
  `likes`, `time_stamp`); `{ new: true }`; `404` if not found or malformed id. Returns the
  updated comment (`200`).
- **GET /comments (get all)** — `find()`; returns an array (empty if none). Frontend groups
  by `post_id`.

All responses use the `{ status, data, message }` contract.

## Grading Checklist (FSD Grading Sheets — m9.csv, "Feature - Backend /comments endpoints")

- [x] **Comment Endpoint - Comment Create** — `POST /comments` creates a comment.
- [x] **Comment Endpoint - Update Comment by ID** — `PATCH /comments/:id` updates a comment.
- [x] **Comment Endpoint - Get All Comments** — `GET /comments` retrieves all comments.
- [ ] **Postman collection** — NOT created this session (consistent with prior endpoint
      features deferring Postman). Outstanding grading item; must cover all three endpoints
      (happy path + 404 cases) before submission.

## Key Decisions

- **Two-way Post ↔ Comment link (Issue 8):** parent Post existence is checked first; the
  Comment is saved; then `comment._id` is `$push`ed onto `Post.comments[]`. Both ⚠️-commented
  in code.
- **Update is content-only:** the PUT handler explicitly sets `{ content: req.body.content }`
  rather than spreading `req.body`, so the other fields cannot be changed via this route.
- `likes` forced to `0` on create; `time_stamp` stored as String, not coerced to Date (Issue 7).
- Malformed `post_id` on create and malformed comment id on update map to `404`; schema
  validation failures map to `400`. ESM imports; models from `server/schemas/`.

## Issues Flagged

No new source-document conflicts; nothing added to `Working/Issues.md`. The two-way-link
requirement (Issue 8) was already recorded and is implemented here.

Operational notes:
1. **Postman collection** deferred (see checklist).
2. **Branch name** is `feature/comment-api`, which matches the feature spec — no discrepancy.
3. ⚠️ **Non-atomic create:** the Comment save and the `Post.comments[]` `$push` are two
   separate operations (no transaction). If the process dies between them, a Comment could
   exist without being referenced by its Post. Acceptable for this module's scope; a real fix
   would use a MongoDB transaction (requires a replica set).

## Intentionally Not Implemented (out of scope)

- Delete comment; filtering comments by `post_id` (frontend groups client-side).
- Updating any field other than `content` via PUT.
- Any Comment or Post schema changes (owned by the Schemas feature).
- Any frontend code.

## Verification Results

- `node --check` passed for `comment.controller.js` and `comment.routes.js`.
- Loaded the router via Node ESM: three routes register — `POST /comments`, `GET /comments`,
  `PATCH /comments/:id` (collection routes before the param route).
- No live MongoDB integration run this session (requires a reachable `MONGO_URI`). Recommend a
  Postman/curl pass: create (valid post_id) → create (unknown post_id → 404) → get-all →
  update content → update unknown-id (404), and confirm the new id appears in Post.comments[].
- The CLIENT folder was not touched, per instructions.
