# 🤖 AI_FEATURE_Backend-Post-Endpoint

This document describes **one Module 10 backend feature of the CodeBloggs project**: the `/posts` API endpoint for deleting posts and cleaning up related comments/replies.

It must be read together with:

1. The Module 10 global AI specification — [`../ai-spec.md`](../ai-spec.md)
2. The Module 9 AI specifications for historical context only

> ⚠️ **Module 10 Scope Warning**
>
> This project is a continuation of Module 9, but this feature spec is for **Module 10 work only**.
> Do not rebuild, redesign, or refactor Module 9 features unless a Module 10 requirement directly depends on it.
>
> Existing Module 9 post behavior should be preserved.
> Module 10 adds admin-focused post deletion and cascade cleanup.

---

## Feature Identity

* **Feature Name:** Post API — Delete Post
* **Related Area:** Backend
* **Module:** Module 10
* **Primary Files:**

  * `server/controllers/post.controller.js`
  * `server/routes/post.routes.js`
* **Schema Location:**

  * `server/schemas/Post.js`
  * `server/schemas/Comment.js`
  * `server/schemas/Reply.js`

---

## Feature Goal

Add backend support for administrators to delete posts from the Content Manager.

When a post is deleted, all comments and replies related to that post must also be cleaned up so the database does not contain orphaned content.

---

## Feature Scope

### In Scope

Module 10 adds:

* `DELETE /posts/:id`
* Post cascade delete logic
* Safe error handling for malformed IDs and missing posts
* Postman testing for post deletion

### Existing Module 9 Behavior to Preserve

Do not remove or break:

* `GET /posts`
* `POST /posts`
* `PATCH /posts/:id`
* Existing likes behavior
* Existing post creation behavior
* Existing response format

### Out of Scope

Do not build:

* Frontend Content Manager
* New post creation behavior
* New post editing behavior
* New authentication system
* New database collections
* Major schema redesign
* Module 9 refactors unrelated to Module 10

---

## Sub-Requirements

### Delete Post

* Accept a post ID from the route parameter.
* Validate that the ID is a valid MongoDB ObjectId.
* Return `400` for malformed IDs.
* Return `404` if the post does not exist.
* Delete the post.
* Delete comments attached to the post.
* Delete replies attached to the post or attached to deleted comments.
* Return a clear success response.

---

## User Flow / Logic

### DELETE /posts/:id

1. Admin sends `DELETE /posts/:id`.
2. Backend validates that `id` is a valid MongoDB ObjectId.
3. Backend checks whether the post exists.
4. Backend finds all comments where `post_id` matches the post ID.
5. Backend collects those comment IDs.
6. Backend deletes replies where:

   * `post_id` matches the deleted post
   * `root_comment_id` matches one of the deleted comments
   * `parent_id` matches one of the deleted comments
7. Backend deletes all comments attached to the post.
8. Backend deletes the post.
9. Backend returns a success response.

---

## Interfaces

### Frontend

This is a backend feature. The frontend will later call this route from:

* `/admin/content`

No frontend code should be changed as part of this feature.

### Backend / API

Base route:

```txt
/posts
```

| Method   | Route        | Purpose                                    |
| -------- | ------------ | ------------------------------------------ |
| `DELETE` | `/posts/:id` | Delete a post and related comments/replies |

Existing Module 9 routes must remain functional:

| Method  | Route        | Purpose                  |
| ------- | ------------ | ------------------------ |
| `GET`   | `/posts`     | Get posts                |
| `POST`  | `/posts`     | Create post              |
| `PATCH` | `/posts/:id` | Update post interactions |

---

## DELETE /posts/:id

### Path Parameter

| Name | Type   | Required | Description               |
| ---- | ------ | -------- | ------------------------- |
| `id` | String | yes      | MongoDB `_id` of the post |

### Sample Success Response — 200

```json
{
  "status": "ok",
  "data": {},
  "message": "Post deleted successfully"
}
```

### Error Responses

Malformed ID:

```json
{
  "status": "error",
  "data": {},
  "message": "Invalid post id"
}
```

Post not found:

```json
{
  "status": "error",
  "data": {},
  "message": "Post not found"
}
```

---

## Data Used or Modified

### Reads

* `Post`
* `Comment`
* `Reply`

### Deletes

* Post document
* Comments attached to deleted post
* Replies attached to deleted post
* Replies rooted under deleted comments
* Replies whose parent is one of the deleted comments

---

## Cascade Delete Rules

When deleting a post, delete related records in this order:

1. Find the post.
2. Find all comments attached to the post.
3. Collect comment IDs.
4. Delete related replies.
5. Delete comments attached to the post.
6. Delete the post last.

This order prevents orphaned comments and replies.

---

## Tech Constraints

* Use existing Express route/controller structure.
* Use `server/schemas`, not `server/models`.
* Use Mongoose methods already common in the project.
* Validate MongoDB ObjectIds before querying.
* Use `{ status, data, message }` response format.
* Do not add new libraries.
* Do not change frontend files.
* Do not change Module 9 behavior unless Module 10 requires it.
* Keep code junior-friendly and readable.

---

## Acceptance Criteria

### Required by Module 10

* [ ] `DELETE /posts/:id` deletes a post by ID.
* [ ] Deleting a post also deletes all comments attached to that post.
* [ ] Deleting a post also deletes related replies.
* [ ] Malformed IDs return `400`.
* [ ] Missing posts return `404`.
* [ ] Successful delete returns `200`.
* [ ] Existing Module 9 post routes still work.

### Postman Verification

* [ ] `DELETE /posts/:id` works for a real test post.
* [ ] `DELETE /posts/:id` returns `400` for malformed ID.
* [ ] `DELETE /posts/:id` returns `404` for nonexistent post.
* [ ] MongoDB confirms related comments are deleted.
* [ ] MongoDB confirms related replies are deleted.
* [ ] Postman collection is updated and exported as `PostmanCollection.json`.

---

## Implementation Log Requirement

Every backend implementation prompt for this feature must create or update an implementation log.

* Folder:

  * `Working/Module_10/Implementation_Logs`
* Filename prefix:

  * `BE`
* Naming convention:

  * Follow the same naming pattern already used by the existing backend logs.
* Log should include:

  * Date
  * Feature implemented
  * Files changed
  * Summary of changes
  * Verification performed
  * Any assumptions
  * Remaining work

---

## Notes for the AI

* This is a **Module 10 update** to the existing Module 9 `/posts` endpoint work.
* Do not remove Module 9 post creation, retrieval, or like/update behavior.
* Do not modify the Post schema unless a Module 10 requirement clearly requires it.
* Keep changes scoped to:

  * `server/controllers/post.controller.js`
  * `server/routes/post.routes.js`
* If existing code uses different helper names or response patterns, follow the existing project style.
