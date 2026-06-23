# 🤖 AI_FEATURE_Backend-User-Endpoint

This document describes **one Module 10 backend feature of the CodeBloggs project**: the `/user` API endpoints that support admin user management.

It must be read together with:

1. The Module 10 global AI specification — [`../ai-spec.md`](../ai-spec.md)
2. The Module 9 AI specifications for historical context only

> ⚠️ **Module 10 Scope Warning**
>
> This project is a continuation of Module 9, but this feature spec is for **Module 10 work only**.
> Do not rebuild, redesign, or refactor Module 9 features unless a Module 10 requirement directly depends on it.
>
> Existing Module 9 endpoints such as `POST /user`, `GET /user`, and `GET /user/:id` should be preserved.
> Module 10 adds admin-focused update and delete behavior on top of the existing user endpoint work.

---

## Feature Identity

* **Feature Name:** User API — Update User and Delete User
* **Related Area:** Backend
* **Module:** Module 10
* **Primary Files:**

  * `server/controllers/user.controller.js`
  * `server/routes/user.routes.js`
* **Schema Location:**

  * `server/schemas/User.js`

---

## Feature Goal

Extend the existing `/user` backend API so administrators can update user records and delete users from the system.

Deleting a user must also clean up related database records so the app does not leave orphaned posts, comments, replies, sessions, or profile picture records.

---

## Feature Scope

### In Scope

Module 10 adds:

* `PATCH /user/:id` — update an existing user by MongoDB `_id`
* `DELETE /user/:id` — delete a user by MongoDB `_id`
* User cascade delete logic
* Safe error handling for malformed IDs and missing users
* Postman testing for update and delete endpoints

### Existing Module 9 Behavior to Preserve

Do not remove or break:

* `POST /user` — create/register user
* `GET /user` — retrieve all users
* `GET /user/:id` — retrieve one user by ID
* Existing response format
* Existing password protection behavior
* Existing auth/session behavior

### Out of Scope

Do not build:

* New authentication system
* New user roles
* New database collections
* Password reset
* Email verification
* Major schema redesign
* Frontend User Manager screen
* Frontend User Update screen
* Any Module 9 refactor that is not required for Module 10

---

## Sub-Requirements

### Update User

* Accept editable user fields from the request body.
* Validate the MongoDB ID.
* Return `400` for malformed IDs.
* Return `404` if the user does not exist.
* Update allowed user fields only.
* If password is updated, hash the new password before saving.
* Never return the password in the response.

### Delete User

* Validate the MongoDB ID.
* Return `400` for malformed IDs.
* Return `404` if the user does not exist.
* Delete the user.
* Delete or clean up all related data:

  * posts written by the user
  * comments written by the user
  * comments attached to the user’s posts
  * replies written by the user
  * replies attached to deleted posts or deleted comments
  * active sessions for the user
  * profile picture records for the user
* Remove deleted comment IDs from remaining `Post.comments[]` arrays.
* Return a clear success response.

---

## User Flow / Logic

### PATCH /user/:id

1. Admin sends `PATCH /user/:id`.
2. Backend validates that `id` is a valid MongoDB ObjectId.
3. Backend checks whether the user exists.
4. Backend updates allowed fields.
5. If a new password is provided, it is hashed before saving.
6. Backend returns the updated user without the password.

---

### DELETE /user/:id

1. Admin sends `DELETE /user/:id`.
2. Backend validates that `id` is a valid MongoDB ObjectId.
3. Backend checks whether the user exists.
4. Backend finds all posts created by the user.
5. Backend collects those post IDs.
6. Backend finds comments:

   * written by the user
   * attached to posts written by the user
7. Backend collects those comment IDs.
8. Backend deletes related replies.
9. Backend deletes matching comments.
10. Backend removes deleted comment IDs from remaining post `comments[]` arrays.
11. Backend deletes posts written by the user.
12. Backend deletes sessions belonging to the user.
13. Backend deletes profile picture records belonging to the user.
14. Backend deletes the user last.
15. Backend returns a success response.

---

## Interfaces

### Frontend

This is a backend feature. The frontend will later call these routes from:

* `/admin/users`
* `/admin/users/:id`

No frontend code should be changed as part of this feature.

### Backend / API

Base route:

```txt
/user
```

| Method   | Route       | Purpose                        |
| -------- | ----------- | ------------------------------ |
| `PATCH`  | `/user/:id` | Update a user by ID            |
| `DELETE` | `/user/:id` | Delete a user and related data |

Existing Module 9 routes must remain functional:

| Method | Route       | Purpose              |
| ------ | ----------- | -------------------- |
| `POST` | `/user`     | Create/register user |
| `GET`  | `/user`     | Get all users        |
| `GET`  | `/user/:id` | Get one user by ID   |

---

## PATCH /user/:id

### Path Parameter

| Name | Type   | Required | Description               |
| ---- | ------ | -------- | ------------------------- |
| `id` | String | yes      | MongoDB `_id` of the user |

### Editable Body Fields

| Name         | Type    | Required | Notes                                               |
| ------------ | ------- | -------- | --------------------------------------------------- |
| `first_name` | String  | no       | User's first name                                   |
| `last_name`  | String  | no       | User's last name                                    |
| `birthday`   | Date    | no       | User's birthday                                     |
| `email`      | String  | no       | Should remain unique                                |
| `password`   | String  | no       | Must be hashed if changed                           |
| `status`     | Boolean | no       | Active/inactive user status                         |
| `location`   | String  | no       | User location                                       |
| `occupation` | String  | no       | User occupation                                     |
| `auth_level` | String  | no       | Should only be changed intentionally by admin logic |

### Sample Request

```json
{
  "first_name": "Jane",
  "last_name": "Updated",
  "location": "Tampa",
  "occupation": "Developer",
  "status": true
}
```

### Sample Success Response — 200

```json
{
  "status": "ok",
  "data": {
    "user": {
      "_id": "user-001",
      "first_name": "Jane",
      "last_name": "Updated",
      "email": "jane@codebloggs.dev",
      "birthday": "1995-12-01T00:00:00.000Z",
      "location": "Tampa",
      "occupation": "Developer",
      "status": true,
      "auth_level": "basic"
    }
  },
  "message": "User updated successfully"
}
```

### Error Responses

Malformed ID:

```json
{
  "status": "error",
  "data": {},
  "message": "Invalid user id"
}
```

User not found:

```json
{
  "status": "error",
  "data": {},
  "message": "User not found"
}
```

---

## DELETE /user/:id

### Path Parameter

| Name | Type   | Required | Description               |
| ---- | ------ | -------- | ------------------------- |
| `id` | String | yes      | MongoDB `_id` of the user |

### Sample Success Response — 200

```json
{
  "status": "ok",
  "data": {},
  "message": "User deleted successfully"
}
```

### Error Responses

Malformed ID:

```json
{
  "status": "error",
  "data": {},
  "message": "Invalid user id"
}
```

User not found:

```json
{
  "status": "error",
  "data": {},
  "message": "User not found"
}
```

---

## Data Used or Modified

### Reads

* `User`
* `Post`
* `Comment`
* `Reply`
* `Session`
* `ProfilePic`

### Updates

* `User`
* `Post.comments[]`

### Deletes

* User document
* Posts written by deleted user
* Comments written by deleted user
* Comments attached to deleted user’s posts
* Replies connected to deleted user, deleted posts, or deleted comments
* Sessions belonging to deleted user
* Profile picture records belonging to deleted user

### Never Returns

* `password`

---

## Cascade Delete Rules

When deleting a user, delete related records in this order:

1. Find posts written by the user.
2. Collect post IDs.
3. Find comments written by the user or attached to the user’s posts.
4. Collect comment IDs.
5. Delete related replies.
6. Delete matching comments.
7. Pull deleted comment IDs from remaining `Post.comments[]` arrays.
8. Delete posts written by the user.
9. Delete sessions belonging to the user.
10. Delete profile picture records belonging to the user.
11. Delete the user last.

This order protects the database from orphaned related records.

---

## Tech Constraints

* Use existing Express route/controller structure.
* Use `server/schemas`, not `server/models`.
* Use Mongoose methods already common in the project.
* Validate MongoDB ObjectIds before querying.
* Use `{ status, data, message }` response format.
* Do not return passwords.
* Do not add new libraries.
* Do not change frontend files.
* Do not change Module 9 behavior unless Module 10 requires it.
* Keep code junior-friendly and readable.

---

## Acceptance Criteria

### Required by Module 10

* [ ] `PATCH /user/:id` updates a user by ID.
* [ ] `DELETE /user/:id` deletes a user by ID.
* [ ] Deleting a user also deletes their posts.
* [ ] Deleting a user also deletes comments on their posts.
* [ ] Deleting a user also deletes comments written by that user.
* [ ] Deleting a user also cleans up related replies.
* [ ] Deleting a user also deletes their sessions.
* [ ] Deleting a user also deletes their profile picture record.
* [ ] Deleted comment IDs are removed from remaining `Post.comments[]` arrays.
* [ ] Malformed IDs return `400`.
* [ ] Missing users return `404`.
* [ ] Successful delete returns `200`.
* [ ] Password is never returned.
* [ ] Existing Module 9 user routes still work.

### Postman Verification

* [ ] `PATCH /user/:id` works with valid data.
* [ ] `PATCH /user/:id` returns `400` for malformed ID.
* [ ] `PATCH /user/:id` returns `404` for nonexistent user.
* [ ] `DELETE /user/:id` works for a real test user.
* [ ] `DELETE /user/:id` returns `400` for malformed ID.
* [ ] `DELETE /user/:id` returns `404` for nonexistent user.
* [ ] Database confirms cascade cleanup.
* [ ] Postman collection is updated and exported as `PostmanCollection.json`.

---

## Notes for the AI

* This is a **Module 10 update** to the existing Module 9 `/user` endpoint work.
* Do not remove Module 9 user registration or retrieval logic.
* Do not modify the User schema unless a Module 10 requirement clearly requires it.
* If password update is implemented, hash the password before saving.
* Add a comment where password is excluded from responses.
* Keep changes scoped to:

  * `server/controllers/user.controller.js`
  * `server/routes/user.routes.js`
* If existing code uses different helper names or response patterns, follow the existing project style.
