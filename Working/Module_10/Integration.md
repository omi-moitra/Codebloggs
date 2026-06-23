# Frontend–Backend Integration Map — Module 10 CodeBloggs

> **Purpose:** This document tracks every frontend feature or path that depends on a new M10 backend endpoint that has not yet been delivered by the partner at the time the frontend is implemented. For each dependency it records:
> - What the backend is expected to provide
> - What the frontend does in the meantime (graceful fallback — no data fabrication; real MongoDB data is already connected)
> - The exact contract (route, response shape, status codes) the backend must fulfill for integration to succeed
>
> **Goal:** The frontend renders correctly and is testable for completed endpoints. Features backed by undelivered endpoints degrade gracefully. When the partner delivers an endpoint, wiring it in requires changes in one place only (the Redux Thunk action) with no changes to components or reducers.
>
> **Not included:** Module 9 endpoints that already exist — those are called directly.  
> **Update this file** whenever a new frontend feature is implemented that depends on a new M10 backend endpoint.

---

## Table of Contents

1. [Endpoint Status Reference](#endpoint-status-reference)
2. [Feature: User Manager](#feature-user-manager)
3. [Feature: User Update Screen](#feature-user-update-screen)
4. [Feature: Content Manager](#feature-content-manager)
5. [Feature: Skeleton Loaders (Reactive Design)](#feature-skeleton-loaders-reactive-design)
6. [Feature: Responsive Navbar](#feature-responsive-navbar)
7. [Integration Checklist](#integration-checklist)

---

## Endpoint Status Reference

| Endpoint | Status | Owner | Notes |
|---|---|---|---|
| `GET /user` | ✅ Exists (M9) | Partner | Call directly |
| `GET /user/:id` | ✅ Exists (M9) | Partner | Call directly |
| `PATCH /user/:id` | 🔴 New (M10) | Partner | Needed for User Update Screen |
| `DELETE /user/:id` | 🔴 New (M10) | Partner | Needed for User Manager delete; must cascade-delete posts + comments |
| `GET /posts` | ✅ Exists (M9) | Partner | Call directly |
| `POST /posts` | ✅ Exists (M9) | Partner | Not touched in M10 frontend |
| `PATCH /posts/:id` | ✅ Exists (M9) | Partner | Post likes/interactions — not touched in M10 frontend |
| `DELETE /posts/:id` | 🔴 New (M10) | Partner | Needed for Content Manager delete; must cascade-delete comments |
| `GET /comments` | ✅ Exists (M9) | Partner | Not touched in M10 frontend |
| `DELETE /comments/:id` | 🔴 New (M10) | Partner | Called by backend cascade only — no direct frontend call |
| `POST /session` | ✅ Exists (M9) | Partner | Login — must include `role` in user object |
| `GET /session/validate` | ✅ Exists (M9) | Partner | Session check |
| `DELETE /session` | ✅ Exists (M9) | Partner | Logout |

---

## Feature: User Manager

**Frontend path:** `/admin/users`  
**Feature spec:** `ai/Module_10/features/frontend/user-manager.feature.md`

### Dependency 1 — Fetch All Users

| | Detail |
|---|---|
| **Endpoint** | `GET /user` |
| **Status** | ✅ Exists from M9 — call directly |
| **Redux action** | `fetchUsers` |
| **Fallback** | None needed — endpoint is live |

**Required response shape (confirm with partner):**
```json
[
  {
    "_id": "string",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "role": "admin | user",
    "profile_image": "string"
  }
]
```

**Notes:** Confirm whether the response is a plain array or wrapped in an object (e.g., `{ users: [...] }`). Update the Redux reducer accordingly.

---

### Dependency 2 — Delete a User

| | Detail |
|---|---|
| **Endpoint** | `DELETE /user/:id` |
| **Status** | 🔴 New M10 endpoint — not yet delivered |
| **Redux action** | `deleteUser(id)` |
| **Fallback** | The Delete button and confirmation modal render normally. On confirm, the Thunk fires the fetch. Until the endpoint exists, the fetch returns a 404 — the action catches the error, dispatches an error state, and the component shows a toast/alert: "Delete unavailable — backend update in progress." The user is NOT removed from the Redux store on error. |

**Backend contract (what the partner must deliver):**
```
DELETE /user/:id
→ 200 OK  (or 204 No Content)
→ Body: { message: "User deleted" }  (or empty on 204)
→ Side effects: all posts by this user must be deleted; all comments on those posts must be deleted
```

**Integration swap (one-line change in the Thunk when endpoint is ready):**
```js
// Before (error state reached naturally because route doesn't exist):
const res = await fetch(`/user/${id}`, { method: 'DELETE' });

// After (no change needed — same line, endpoint now exists):
const res = await fetch(`/user/${id}`, { method: 'DELETE' });
```
No component or reducer changes needed.

---

### Dependency 3 — Admin Role in Auth State

| | Detail |
|---|---|
| **Endpoint** | `POST /session` (login) |
| **Status** | ✅ Exists from M9 |
| **Used in** | Admin route guard reads `state.auth.user.role` from Redux |
| **Concern** | The M9 login response must include `role` in the user object for the route guard to work |

**Confirm with partner:** Does the existing `POST /session` response include `role`? If the M9 user object does not have `role`, the route guard will fail to distinguish admins. The partner must either add `role` to the session response or the Redux auth reducer must be updated to fetch it separately.

---

## Feature: User Update Screen

**Frontend path:** `/admin/users/:id` (full page — `EditUserPage` inside Admin Page Shell)  
**Feature spec:** `ai/Module_10/features/frontend/user-update.feature.md`  
**Status:** ✅ Frontend implemented — waiting on backend `PATCH /user/:id`

### Dependency 1 — Fetch Single User

| | Detail |
|---|---|
| **Endpoint** | `GET /user/:id` |
| **Status** | ✅ Exists from M9 — call directly |
| **Used in** | `EditUserPage` — called only as a fallback when the user navigates directly to `/admin/users/:id` without going through the User Manager (where `fetchUsers` pre-populates the store). The store lookup via `state.users.users.find(u => u._id === id)` is the primary path. |
| **Fallback** | None needed — endpoint is live |

---

### Dependency 2 — Update a User

| | Detail |
|---|---|
| **Endpoint** | `PATCH /user/:id` |
| **Status** | 🔴 New M10 endpoint — not yet delivered |
| **Redux action** | `updateUser(id, payload)` |
| **Fallback** | The Edit User modal renders and pre-populates normally. On submit confirmation, the Thunk fires the fetch. Until the endpoint exists, the fetch returns a 404 — the action catches the error, dispatches an error state, and the modal shows an inline alert: "Update unavailable — backend update in progress." The modal stays open. The user is NOT updated in the Redux store on error. |

**Backend contract (what the partner must deliver):**
```
PATCH /user/:id
→ Body: { first_name?, last_name?, email?, password? }  (all fields optional — partial update)
→ 200 OK
→ Body: { ...updatedUser }  (the full updated user object, same shape as GET /user response)
→ If password is included: backend must hash before saving — never store plain-text
→ If password is excluded: do not modify the existing password
→ Side effects: none (no cascade logic needed for update)
```

**Required response shape (confirm with partner):**
```json
{
  "_id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "role": "admin | user",
  "profile_image": "string"
}
```

**Integration swap (one-line change in the Thunk when endpoint is ready):**
```js
// Before (error state reached naturally because route doesn't exist):
const res = await fetch(`/user/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });

// After (no change needed — same line, endpoint now exists):
const res = await fetch(`/user/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
```
No component or reducer changes needed — only the endpoint must exist and return the expected shape.

---

## Feature: Content Manager

**Frontend path:** `/admin/content`  
**Feature spec:** `ai/Module_10/features/frontend/content-manager.feature.md`  
**Status:** ✅ Frontend implemented — waiting on backend `DELETE /posts/:id`

### Dependency 1 — Fetch All Posts

| | Detail |
|---|---|
| **Endpoint** | `GET /posts` |
| **Status** | ✅ Exists from M9 — call directly |
| **Redux action** | `fetchPosts` |
| **Fallback** | None needed — endpoint is live |

**Required response shape (confirm with partner):**
```json
[
  {
    "_id": "string",
    "title": "string",
    "content": "string",
    "user_id": "string",
    "first_name": "string",
    "last_name": "string",
    "time_stamp": "ISO 8601 string",
    "likes": [],
    "comments": []
  }
]
```

**⚠️ Critical — author name population:** Confirm with partner whether `GET /posts` returns `first_name` and `last_name` inline (populated via Mongoose `.populate()`), or only a `user_id`. If only `user_id` is returned, the Author column cannot be rendered without a separate lookup per post — this must be resolved before the Content Manager table can show author names. Display `user_id` as a fallback until confirmed.

---

### Dependency 2 — Delete a Post

| | Detail |
|---|---|
| **Endpoint** | `DELETE /posts/:id` |
| **Status** | 🔴 New M10 endpoint — not yet delivered |
| **Redux action** | `deletePost(id)` |
| **Fallback** | The Delete button and confirmation modal render normally. On confirm, the Thunk fires the fetch. Until the endpoint exists, the fetch returns a 404 — the action catches the error, dispatches an error state, and the component shows a toast/alert: "Delete unavailable — backend update in progress." The post is NOT removed from the Redux store on error. |

**Backend contract (what the partner must deliver):**
```
DELETE /posts/:id
→ 200 OK  (or 204 No Content)
→ Body: { message: "Post deleted" }  (or empty on 204)
→ Side effects: all comments on this post must be deleted
```

**Integration swap (one-line change in the Thunk when endpoint is ready):**
```js
// Before (error state reached naturally because route doesn't exist):
const res = await fetch(`/posts/${id}`, { method: 'DELETE' });

// After (no change needed — same line, endpoint now exists):
const res = await fetch(`/posts/${id}`, { method: 'DELETE' });
```
No component or reducer changes needed.

---

## Feature: Skeleton Loaders (Reactive Design)

**Frontend path:** `/admin/users`, `/admin/content`  
**Feature spec:** `ai/Module_10/features/frontend/reactive-design.feature.md` *(not yet written)*

No new backend dependencies. Skeleton loaders are triggered by existing Redux `LOADING` action states already dispatched by `fetchUsers` and `fetchPosts`. No integration concerns.

---

## Feature: Responsive Navbar

**Frontend path:** All pages  
**Feature spec:** `ai/Module_10/features/frontend/responsive-design.feature.md`

✅ **Implemented.** No backend dependencies. Pure CSS and Bootstrap component layout changes.

**Files modified:**
- `client/src/components/Header.jsx` — hamburger toggle, collapsible nav dropdown, Bootstrap visibility classes
- `client/src/layout/MainLayout.jsx` — Bootstrap grid (Container/Row/Col) replacing flat flex div
- `client/src/styles/theme.css` — hamburger/dropdown styles, section 15/16 responsive rules
- `README.md` — Responsive Design section with breakpoints table

No orphaned tasks — this feature has no counterpart backend work.

---

## Integration Checklist

Use this checklist when the backend partner signals that a new M10 endpoint is ready.

### User Manager

- [ ] Confirm `GET /user` response shape — plain array or object-wrapped? Update reducer if needed
- [ ] Confirm `POST /session` response includes `role` field — if not, coordinate fix with partner
- [ ] Partner delivers `DELETE /user/:id` with cascade
- [ ] Test delete with a real user: verify user disappears from the table and their posts/comments are removed from MongoDB
- [ ] Remove error-fallback path from `deleteUser` Thunk (or leave it — it will simply never be reached once the endpoint exists)

### User Update Screen

- [ ] Confirm `GET /user/:id` response shape matches the shape used to pre-populate the Edit User modal fields — update prop mapping if needed
- [ ] Partner delivers `PATCH /user/:id` accepting a partial body (`first_name?`, `last_name?`, `email?`, `password?`)
- [ ] Confirm that if `password` is omitted from the body, the backend does NOT overwrite the existing password
- [ ] Confirm the `PATCH` response returns the full updated user object (same shape as `GET /user` array entries)
- [ ] Test edit with a real user: verify the Redux store updates and the User Manager table reflects the change without a page reload
- [ ] Test password change: verify new password works for login; verify plain-text is not stored in MongoDB
- [ ] Remove or verify the inline error-fallback path in `updateUser` Thunk (it will simply never be reached once the endpoint exists)

### Content Manager

- [ ] Confirm `GET /posts` response shape — does it include `first_name` and `last_name` inline, or only `user_id`? If only `user_id`, coordinate with partner to populate author names (`.populate()` on the backend, or a separate lookup strategy)
- [ ] Confirm `time_stamp` field name and format (ISO 8601 string expected) — update date filter comparison logic if format differs
- [ ] Partner delivers `DELETE /posts/:id` with cascade (all comments on the post must be deleted)
- [ ] Test delete with a real post: verify post disappears from the table and its comments are removed from MongoDB
- [ ] Remove error-fallback path from `deletePost` Thunk (or leave it — it will simply never be reached once the endpoint exists)
