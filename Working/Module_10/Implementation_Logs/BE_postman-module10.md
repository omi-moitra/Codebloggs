# BE Implementation Log — Module 10 Postman Collection

**Feature:** Module 10 Backend Postman Collection  
**Role:** Backend  
**Date:** 2026-06-23  
**Collection:** `PostmanCollection.json`

---

## Collection File Updated

| File | Change |
|---|---|
| `PostmanCollection.json` | Replaced existing JSON with a fully updated Postman Collection v2.1 file |
| `PostmanCollection.json` | Preserved all implemented Module 9 backend requests |
| `PostmanCollection.json` | Added all completed Module 10 backend requests |

## Endpoints Added

| Method | URL | Scenario |
|---|---|---|
| `PATCH` | `{{base_url}}/user/{{user_id}}` | Happy path |
| `PATCH` | `{{base_url}}/user/not-a-valid-id` | Malformed MongoDB id |
| `PATCH` | `{{base_url}}/user/507f1f77bcf86cd799439011` | Valid but nonexistent user id |
| `DELETE` | `{{base_url}}/user/{{user_id}}` | Happy path |
| `DELETE` | `{{base_url}}/user/not-a-valid-id` | Malformed MongoDB id |
| `DELETE` | `{{base_url}}/user/507f1f77bcf86cd799439011` | Valid but nonexistent user id |
| `DELETE` | `{{base_url}}/posts/{{post_id}}` | Happy path |
| `DELETE` | `{{base_url}}/posts/not-a-valid-id` | Malformed MongoDB id |
| `DELETE` | `{{base_url}}/posts/507f1f77bcf86cd799439011` | Valid but nonexistent post id |
| `DELETE` | `{{base_url}}/comments/{{comment_id}}` | Happy path |
| `DELETE` | `{{base_url}}/comments/not-a-valid-id` | Malformed MongoDB id |
| `DELETE` | `{{base_url}}/comments/507f1f77bcf86cd799439011` | Valid but nonexistent comment id |

---

## Variables Added / Confirmed

| Variable | Value | Purpose |
|---|---|---|
| `base_url` | `http://localhost:5050` | Backend API base URL |
| `user_id` | `000000000000000000000000` | Used by Module 10 user update/delete requests; existing create-user request can overwrite it |
| `post_id` | `000000000000000000000000` | Used by Module 10 post delete request; existing create-post request can overwrite it |
| `comment_id` | `000000000000000000000000` | Used by Module 10 comment delete request; existing create-comment request can overwrite it |
| `reply_id` | `000000000000000000000000` | Preserved for Module 9 reply update request; existing create-reply request can overwrite it |

---

## Files Modified

| File | Change |
|---|---|
| `PostmanCollection.json` | Replaced with updated import-ready collection |
| `PostmanCollection.json` | Added `Module 10 Backend` folder with User, Post, and Comment Endpoint subfolders |
| `PostmanCollection.json` | Added/confirmed collection variables for `base_url`, `user_id`, `post_id`, `comment_id`, and `reply_id` |

---

## Verification Performed

- Reviewed backend implementations for:
  - `PATCH /user/:id`
  - `DELETE /user/:id`
  - `DELETE /posts/:id`
  - `DELETE /comments/:id`
- Confirmed Module 10 request URLs use variables where appropriate:
  - `PATCH {{base_url}}/user/{{user_id}}`
  - `DELETE {{base_url}}/user/{{user_id}}`
  - `DELETE {{base_url}}/posts/{{post_id}}`
  - `DELETE {{base_url}}/comments/{{comment_id}}`
- Confirmed collection JSON parses successfully with Node.
- Confirmed the collection uses Postman Collection v2.1 schema.
- Confirmed all request URLs use `{{base_url}}`.
- Confirmed all 18 implemented Module 9 backend requests are present.
- Confirmed all 12 completed Module 10 backend requests are present.
- Confirmed every request has a description.
- Confirmed each Module 10 endpoint includes happy path, malformed id, and nonexistent id requests.
- Added request descriptions with headers, body requirements, success responses, and error responses.

---

## Remaining Endpoints Not Yet Added

- No completed Module 10 backend endpoints are currently missing from the collection.
- Future Module 10 backend endpoints should be added only after they are implemented and verified.

---

## Assumptions

- Happy-path destructive requests should be run only against throwaway test data.
- Existing Module 9 create/login/post/comment/reply requests may be used as supporting setup requests to populate `user_id` and `post_id`.
