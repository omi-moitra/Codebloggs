# 🤖 AI_FEATURE_Backend-Comment-Endpoint

This document describes **one Module 10 backend feature of the CodeBloggs project**: the `/comments` API endpoint for deleting comments and cleaning up related replies.

It must be read together with:

1. The Module 10 global AI specification — [`../ai-spec.md`](../ai-spec.md)
2. The Module 9 AI specifications for historical context only

> ⚠️ **Module 10 Scope Warning**
>
> This project is a continuation of Module 9, but this feature spec is for **Module 10 work only**.
> Do not rebuild, redesign, or refactor Module 9 features unless a Module 10 requirement directly depends on it.
>
> Existing Module 9 comment behavior should be preserved.
> Module 10 adds admin-focused comment deletion and cleanup behavior.

---

## Feature Identity

* **Feature Name:** Comment API — Delete Comment
* **Related Area:** Backend
* **Module:** Module 10
* **Primary Files:**

  * `server/controllers/comment.controller.js`
  * `server/routes/comment.routes.js`
* **Schema Location:**

  * `server/schemas/Comment.js`
  * `server/schemas/Post.js`
  * `server/schemas/Reply.js`

---

## Feature Goal

Add backend support for administrators to delete individual comments from the system.

When a comment is deleted, the backend must also remove related replies and remove the deleted comment ID from the parent post’s `comments[]` array.

---

## Feature Scope

### In Scope

Module 10 adds:

* `DELETE /comments/:id`
* Comment delete logic
* Reply cleanup for replies connected to the deleted comment
* Removal of deleted comment ID from `Post.comments[]`
* Safe error handling for malformed IDs and missing comments
* Postman testing for comment deletion

### Existing Module 9 Behavior to Preserve

Do not remove or break:

* `GET /comments`
* `POST /comments`
* `PATCH /comments/:id`
* Existing comment creation behavior
* Existing comment update behavior
* Existing response format

### Out of Scope

Do not build:

* Frontend Content Manager
* New comment creation behavior
* New comment editing behavior
* New authentication system
* New database collections
* Major schema redesign
* Module 9 refactors unrelated to Module 10

---

## Sub-Requirements

### Delete Comment

* Accept a comment ID from the route parameter.
* Validate that the ID is a valid MongoDB ObjectId.
* Return `400` for malformed IDs.
* Return `404` if the comment does not exist.
* Delete replies connected to the comment.
* Remove the comment ID from the parent post’s `comments[]` array.
* Delete the comment.
* Return a clear success response.

---

## User Flow / Logic

### DELETE /comments/:id

1. Admin sends `DELETE /comments/:id`.
2. Backend validates that `id` is a valid MongoDB ObjectId.
3. Backend checks whether the comment exists.
4. Backend finds replies where:

   * `root_comment_id` matches the deleted comment ID
   * `parent_id` matches the deleted comment ID
5. Backend deletes those related replies.
6. Backend removes the deleted comment ID from the parent post’s `comments[]` array.
7. Backend deletes the comment.
8. Backend returns a success response.

---

## Interfaces

### Frontend

This is a backend feature. The frontend may later call this route from:

* `/admin/content`

No frontend code should be changed as part of this feature.

### Backend / API

Base route:

```txt
/comments
```

| Method   | Route           | Purpose                              |
| -------- | --------------- | ------------------------------------ |
| `DELETE` | `/comments/:id` | Delete a comment and related replies |

Existing Module 9 routes must remain functional:

| Method  | Route           | Purpose        |
| ------- | --------------- | -------------- |
| `GET`   | `/comments`     | Get comments   |
| `POST`  | `/comments`     | Create comment |
| `PATCH` | `/comments/:id` | Update comment |

---

## DELETE /comments/:id

### Path Parameter

| Name | Type   | Required | Description                  |
| ---- | ------ | -------- | ---------------------------- |
| `id` | String | yes      | MongoDB `_id` of the comment |

### Sample Success Response — 200

```json
{
  "status": "ok",
  "data": {},
  "message": "Comment deleted successfully"
}
```

### Error Responses

Malformed ID:

```json
{
  "status": "error",
  "data": {},
  "message": "Invalid comment id"
}
```

Comment not found:

```json
{
  "status": "error",
  "data": {},
  "message": "Comment not found"
}
```

---

## Data Used or Modified

### Reads

* `Comment`
* `Post`
* `Reply`

### Updates

* `Post.comments[]`

### Deletes

* Comment document
* Replies rooted under the deleted comment
* Replies whose parent is the deleted comment

---

## Delete Rules

When deleting a comment, clean up records in this order:

1. Find the comment.
2. Delete related replies.
3. Pull the comment ID from the parent post’s `comments[]` array.
4. Delete the comment last.

This prevents the frontend from trying to display a deleted comment ID from a post document.

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

* [ ] `DELETE /comments/:id` deletes a comment by ID.
* [ ] Deleting a comment also deletes related replies.
* [ ] Deleting a comment removes the comment ID from the parent post’s `comments[]` array.
* [ ] Malformed IDs return `400`.
* [ ] Missing comments return `404`.
* [ ] Successful delete returns `200`.
* [ ] Existing Module 9 comment routes still work.

### Postman Verification

* [ ] `DELETE /comments/:id` works for a real test comment.
* [ ] `DELETE /comments/:id` returns `400` for malformed ID.
* [ ] `DELETE /comments/:id` returns `404` for nonexistent comment.
* [ ] MongoDB confirms the comment is deleted.
* [ ] MongoDB confirms related replies are deleted.
* [ ] MongoDB confirms the parent post no longer contains the deleted comment ID.
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

* This is a **Module 10 update** to the existing Module 9 `/comments` endpoint work.
* Do not remove Module 9 comment creation, retrieval, or update behavior.
* Do not modify the Comment schema unless a Module 10 requirement clearly requires it.
* Keep changes scoped to:

  * `server/controllers/comment.controller.js`
  * `server/routes/comment.routes.js`
* If existing code uses different helper names or response patterns, follow the existing project style.
