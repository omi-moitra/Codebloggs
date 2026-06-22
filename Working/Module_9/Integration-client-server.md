# Integration Log — Client ↔ Server

**Branch:** `dev`  
**Date:** 2026-06-16  
**Scope:** Full audit of `client/src/` against `server/` — every route, every service call, every auth flow.

---

## How the stack is wired

| Layer | Tech | Port / URL |
|---|---|---|
| Client dev server | Vite + React | `http://localhost:3000` (set via `VITE_DEV_SERVER_PORT` in `vite.config.js`) |
| API server | Express + MongoDB | `http://localhost:5050` (set via `PORT` in `server/.env`) |
| API base URL (client) | `VITE_API_BASE_URL` env var | defaults to `http://localhost:5050` |
| CORS origin (server) | `CLIENT_ORIGIN` env var | `http://localhost:3000` (in `server/.env`) |
| Auth mechanism | httpOnly cookie | Set server-side via `res.cookie("session_token", ...)`, sent automatically by browser via `credentials: "include"` on every fetch |

Client → Server calls go directly (no Vite proxy for API routes). CORS is correctly configured: explicit origin + `credentials: true`. Both sides agree on the same ports.

---

## Issue 1 — `main.jsx`: `AuthProvider` stripped, all routes unprotected

| | |
|---|---|
| **File** | `client/src/main.jsx` |
| **What changed** | A linter/editor edit removed `AuthProvider`, `RequireAuth`, and related imports. Protected routes (`/home`, `/blogs`, `/network`, `/admin`) were rendered directly inside `MainLayout` with no session check. The admin-only guard (`RequireAuth requireAdmin`) was also gone. |
| **Why it breaks** | Every component that calls `useAuth()` — `Login`, `Register`, `Header`, `Sidebar`, `RequireAuth` — throws `"useAuth must be used inside AuthProvider"` at mount. The app is completely non-functional. Additionally, any unauthenticated visitor can reach `/home`, `/blogs`, `/network`, and `/admin` directly. |
| **Fix applied** | Restored `AuthProvider` wrapping `RouterProvider`. Restored the two-level `RequireAuth` guard: outer `RequireAuth` (session check) wraps all app pages; inner `RequireAuth requireAdmin redirectTo="/home"` wraps `/admin` specifically. |
| **Server contract** | `GET /session/validate` is what `validateSession()` in `authService.js` calls. Returns `{ status, data: { user }, message }`. `RequireAuth` renders a loading state while `isChecking === true` (the validate call is in flight), then either passes through or redirects to `/login`. |
| **Status** | Already restored before this session. Verified correct. No code change needed. |

---

## Issue 2 — `MainLayout.jsx`: `PostModal` stripped, `Header` receives no props

| | |
|---|---|
| **File** | `client/src/layout/MainLayout.jsx` |
| **What changed** | Same edit that hit `main.jsx` also simplified `MainLayout` to a static shell: removed `useState` hooks, the feedback `Alert`, `PostModal`, `handlePostCreated`, and `handleAccountSettings`. `Header` was rendered with no props. |
| **Why it breaks** | `Header` declares both `onOpenPostModal` and `onAccountSettings` as `PropTypes.func.isRequired`. When the user clicks the **Post** button or **Account Settings** button in the header, JavaScript calls `undefined()` → `TypeError: onOpenPostModal is not a function`. Post creation is completely broken. The `codebloggs:post-created` custom event (used by `Home` and `Blogs` to refresh their feeds) is also never dispatched. |
| **Fix applied** | Restored `useState` for `isPostModalOpen` and `feedback`. Restored `handlePostCreated` (calls `createPost` via `PostModal`, then dispatches `codebloggs:post-created` so pages reload). Restored `handleAccountSettings` (shows an info alert). Restored the dismissible feedback `Alert`. Re-added `PostModal` with `isOpen`, `onClose`, `onCreated` props. Re-added both props to `Header`. |
| **Server contract** | `POST /posts` requires a valid session cookie (`requireSession` middleware). `createPost` in `postService.js` sends `{ content }` and `credentials: "include"`. Server reads `user_id` from `req.user._id` (never from the body). Returns `{ status, data: { post }, message }`. `postService.getPostFromPayload` normalises `payload.data.post`. |
| **Status** | Already restored before this session. Verified correct. No code change needed. |

---

## Issue 3 — `Home.jsx` + `Blogs.jsx`: Like count sends absolute value, server applies it as an increment

| | |
|---|---|
| **Files** | `client/src/pages/Home.jsx` · `client/src/pages/Blogs.jsx` |
| **Root cause** | `PATCH /posts/:id` on the server uses MongoDB `$inc: { likes }` — it **increments** the stored count by whatever number is received. The client computed `nextLikes = post.likes + 1` (e.g. `6` if the current count was `5`) and sent that absolute value. The server then added `6` to the stored `5`, producing `11`. Each subsequent click would geometrically inflate the count. |
| **Server code** | `post.controller.js` line ~65: `Post.findByIdAndUpdate(req.params.id, { $inc: { likes } }, ...)` |
| **Client code before** | `const nextLikes = Number(post.likes \|\| 0) + 1; … updatePostLikes(postId, nextLikes)` |
| **Fix applied** | Changed both `handleLike` functions to send `1` (the delta), which matches the server's `$inc` semantics. Removed the now-unused `nextLikes` variable. Updated the optimistic-update fallback to inline `(post.likes \|\| 0) + 1` so it stays correct if the server response is missing. |
| **Client code after** | `updatePostLikes(postId, 1)` — the server increments by exactly 1 each time. |
| **Status** | **Fixed.** Applied to both `Home.jsx` and `Blogs.jsx`. |

---

## Non-breaking observations (no code change)

### A — `authService.js`: `react-use-cookie` layer is non-functional but harmless

The server sets the session cookie with `httpOnly: true`, which prevents JavaScript from reading it (`document.cookie` does not expose httpOnly cookies). The `readSessionToken`, `writeSessionToken`, and `clearSessionToken` helpers in `authService.js` use `react-use-cookie`, which cannot read or write that cookie. They silently no-op.

Auth still works correctly because `apiClient.js` passes `credentials: "include"` on every `fetch` call — the browser automatically attaches the httpOnly cookie to requests sent to the same host. `requireSession` middleware reads `req.cookies.session_token` server-side, which is populated by `cookie-parser`. No JS needs to touch the token.

The `react-use-cookie` calls are dead code. They don't cause failures and removing them would be a cleanup-only change; leaving them in place is safe.

### B — `authService.js`: sends `auth_level: "basic"` to `POST /user`

`registerUser` spreads the form data and appends `auth_level: "basic"` before posting to `/user`. The server's `createUser` controller ignores this field and always hardcodes `auth_level: "basic"` server-side (with a comment explaining why). The extra field is harmless.

### C — `vite.config.js`: proxy only covers `/record`

The Vite proxy config routes `/record` to the API server. `/record` is a MERN starter scaffold route that is not registered in `server.js` and has no route file — it's dead code on both sides. The real API routes (`/session`, `/user`, `/posts`, `/comments`) go directly to `http://localhost:5050` via `VITE_API_BASE_URL`, which is correct and working because CORS is properly configured.

### D — `Navbar.jsx`, `Record.jsx`, `RecordList.jsx`: unused MERN scaffold

These three components are never imported or rendered. They are MERN-starter leftovers. No route references them. Safe to ignore or delete in a cleanup pass.

---

## Route × endpoint coverage matrix

| Client call | Service file | HTTP | Server route | Auth required | Status |
|---|---|---|---|---|---|
| Login form submit | `authService.loginUser` | `POST /session` | `session.routes.js → session.controller.login` | No | ✓ Working |
| Session validation on load | `authService.validateSession` | `GET /session/validate` | `session.routes.js → session.controller.validate` | Cookie | ✓ Working |
| Logout button | `authService.logoutUser` | `DELETE /session` | `session.routes.js → session.controller.logout` | Cookie | ✓ Working |
| Register form submit | `authService.registerUser` | `POST /user` | `user.routes.js → user.controller.createUser` | No | ✓ Working |
| Home profile card | `userService.getUserById` | `GET /user/:id` | `user.routes.js → user.controller.getUserById` | No | ✓ Working |
| Network page user grid | `userService.getUsers` | `GET /user` | `user.routes.js → user.controller.getAllUsers` | No | ✓ Working |
| Post feed (Home, Blogs, Network) | `postService.getPosts` | `GET /posts` | `post.routes.js → post.controller.getAllPosts` | No | ✓ Working |
| Post creation (PostModal) | `postService.createPost` | `POST /posts` | `post.routes.js → post.controller.createPost` | Session cookie | ✓ Working |
| Like button | `postService.updatePostLikes` | `PATCH /posts/:id` | `post.routes.js → post.controller.updatePost` | No | ✓ Fixed (Issue 3) |
| Comment feed (Home, Blogs) | `commentService.getComments` | `GET /comments` | `comment.routes.js → comment.controller.getAllComments` | No | ✓ Working |
| Add comment | `commentService.createComment` | `POST /comments` | `comment.routes.js → comment.controller.createComment` | Session cookie | ✓ Working |
| Fetch replies (Home, Blogs) | `replyService.getReplies` | `GET /replies` | `reply.routes.js → reply.controller.getRepliesByPost` | No | ✓ Working |
| Post reply | `replyService.createReply` | `POST /replies` | `reply.routes.js → reply.controller.createReply` | Session cookie | ✓ Fixed (Issue 4) |
| Like a reply | `replyService.updateReplyLikes` | `PUT /replies/:id` | `reply.routes.js → reply.controller.updateReply` | No | ✓ Fixed (Issue 4) |

---

## Response shape contract

All server responses follow `{ status, data, message }`. Client service files use normalisation helpers (`getPostFromPayload`, `getUserFromPayload`, etc.) that check `payload.data.X` first, then `payload.X` as a fallback. This makes them resilient to minor shape variations.

---

---

## Issue 4 — Replies never reached MongoDB

| | |
|---|---|
| **Files** | `client/src/pages/Home.jsx` · `client/src/pages/Blogs.jsx` |
| **Root cause** | `handleReplySubmit` was synchronous and made no API call. It built a local reply object (`id: "local-reply-*"`) and wrote it into `localReplies` React state. State is discarded on page refresh — nothing ever reached the `POST /replies` endpoint. |
| **Server side** | Already fully implemented: `server/schemas/Reply.js`, `server/controllers/reply.controller.js`, `server/routes/reply.routes.js`, mounted at `/replies` in `server.js`. Reply schema uses `parent_id` + `parent_type` ("Comment"\|"Reply") + `root_comment_id` for threaded nesting up to depth 3. |
| **What was also fixed** | `GET /replies` required `post_id` query param; changed to make it optional so both pages can fetch all replies in a single call (consistent with `GET /comments`). |
| **Client service created** | `client/src/services/replyService.js` — `getReplies()`, `createReply({ parentId, parentType, rootCommentId, postId, content, depth })`, `updateReplyLikes(replyId, delta)`. |
| **Page changes (both Home + Blogs)** | (1) Import `createReply, getReplies, updateReplyLikes` from replyService. (2) Added `replies`, `likingReplyId` state. (3) `getReplies()` added to the parallel data fetch on load. (4) Added `repliesByParentId` memo (groups replies by `parent_id`). (5) Added `normalizeReply` helper (maps server doc → render shape with author name/initials from `usersById`). (6) `handleReplySubmit` made `async`: posts optimistic local entry first, calls `createReply`, on success adds real reply to `replies` state and drops the local entry. (7) `handleReplyLike` made `async`: calls `updateReplyLikes` for server replies, updates `localReplies` for optimistic-only replies. (8) `renderReplyForm` and `renderReplies` now accept `postId` and `rootCommentId` to pass to `handleReplySubmit`. (9) `renderReplies` merges server replies (from `repliesByParentId`) with any pending local replies. |
| **Home.jsx extra** | Added `users` state + `getUsers()` fetch + `usersById` memo (needed to resolve reply author names, which Blogs already had). |

---

## Files changed in this session

| File | Change |
|---|---|
| `client/src/pages/Home.jsx` | Likes delta fix; reply persistence (see Issues 3 + 4) |
| `client/src/pages/Blogs.jsx` | Same |
| `client/src/services/replyService.js` | **Created** — `getReplies`, `createReply`, `updateReplyLikes` |
| `server/controllers/reply.controller.js` | `GET /replies` no longer requires `post_id` query param |

Files that were already correct (regressions previously self-healed):
- `client/src/main.jsx` — `AuthProvider` + `RequireAuth` present
- `client/src/layout/MainLayout.jsx` — `PostModal` + `useState` + Header props present
