# BE Implementation Log — Module 10 Postman Collection

**Feature:** Module 10 Backend Postman Requests  
**Role:** Backend  
**Date:** 2026-06-23  
**Collection:** `PostmanCollection.json`

---

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

---

## Variables Added / Confirmed

| Variable | Value | Purpose |
|---|---|---|
| `base_url` | `http://localhost:5050` | Backend API base URL |
| `user_id` | `000000000000000000000000` | Used by Module 10 user update/delete requests; existing create-user request can overwrite it |
| `post_id` | `000000000000000000000000` | Used by Module 10 post delete request; existing create-post request can overwrite it |

---

## Files Modified

| File | Change |
|---|---|
| `PostmanCollection.json` | Added `Module 10 Backend` folder with completed backend endpoint requests |
| `PostmanCollection.json` | Added/confirmed collection variables for `base_url`, `user_id`, and `post_id` |

---

## Verification Performed

- Reviewed backend implementations for:
  - `PATCH /user/:id`
  - `DELETE /user/:id`
  - `DELETE /posts/:id`
- Confirmed Module 10 request URLs use variables where appropriate:
  - `PATCH {{base_url}}/user/{{user_id}}`
  - `DELETE {{base_url}}/user/{{user_id}}`
  - `DELETE {{base_url}}/posts/{{post_id}}`
- Confirmed collection JSON parses successfully with Node.
- Confirmed existing requests were preserved.
- Confirmed each Module 10 endpoint includes happy path, malformed id, and nonexistent id requests.
- Added request descriptions with headers, body requirements, success responses, and error responses.

---

## Remaining Endpoints Not Yet Added

- Backend Comment delete endpoint requests are not added yet because `DELETE /comments/:id` has not been implemented in the backend during this workstream.
- Any future Module 10 backend endpoints should be added after they are implemented and verified.

---

## Assumptions

- Happy-path destructive requests should be run only against throwaway test data.
- Existing Module 9 create/login/post/comment/reply requests may be used as supporting setup requests to populate `user_id` and `post_id`.
