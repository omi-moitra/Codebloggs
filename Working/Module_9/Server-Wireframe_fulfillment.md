# CodeBloggs Full-Stack Integration Report

**Audit date:** 2026-06-16 | **Branch:** docs-O
All 11 discrepancies resolved. This report maps every wireframe feature component to its
Express endpoint, controller logic, and Mongoose schema target.

---

## Auth Contract (applies to every page)

Every protected page calls `GET /session/validate` on load. The response either returns the
authenticated user — which drives the header username, the Admin nav gate, and the user data
panel — or 401s the client back to the Login screen.

| Contract element | Implementation |
|---|---|
| Cookie name | `session_token` (httpOnly, sameSite: lax) — defined once in `server/lib/session.config.js`, imported by both `session.controller.js` and `middleware/requireSession.js` |
| Session TTL | 24 hours derived at runtime: `session_date.getTime() + SESSION_TTL` — no stored expiry field |
| Auth level gating | `auth_level: "basic" \| "admin"` returned on every `/session/validate` response; Admin nav link is shown/hidden client-side |
| Password safety | bcrypt hash stored; `.select("-password")` on every user query; `delete safeUser.password` on login response |

---

## Login / Registration Wireframe

### Login form → `POST /session` → `Session` + `User`

`session.controller.js → login()`

1. Reads `email` + `password` from `req.body`
2. `User.findOne({ email })` — same 401 message whether email is unknown or password is wrong (no enumeration)
3. `bcrypt.compare(password, user.password)`
4. `Session.create({ session_id: crypto.randomUUID(), session_date: new Date(), user: user._id })`
5. `res.cookie(COOKIE_NAME, session_id, COOKIE_OPTIONS)` — sets the httpOnly cookie the browser will forward on all subsequent requests
6. Returns `{ status: "ok", data: { user }, message: "Login successful" }` with password stripped

### Registration form → `POST /user` → `User`

`user.controller.js → createUser()`

| Wireframe field | Schema field | Notes |
|---|---|---|
| First Name | `first_name` (String, required) | |
| Last Name | `last_name` (String, required) | |
| email | `email` (String, required, unique) | Duplicate → 409 before hash |
| birthdate | `birthday` (Date, required) | |
| password | `password` (String, required) | bcrypt hash, SALT_ROUNDS=10; never returned |
| Occupation | `occupation` (String, optional) | |
| location | `location` (String, optional) | |
| — | `auth_level` | Always forced to `"basic"` server-side; client cannot set this |
| — | `status` | Always forced to `true` (Boolean) server-side; client cannot set this |

Returns 201 with `{ status: "ok", data: { user } }`. Frontend routes back to Login on success.

---

## Main / Post Modal Wireframe

### Header — session validation → `GET /session/validate` → `Session` → `User`

`session.controller.js → validate()`

1. Reads `session_token` cookie from `req.cookies`
2. `Session.findOne({ session_id }).populate({ path: "user", select: "-password" })`
3. Checks `session_date.getTime() + SESSION_TTL > Date.now()`; expired sessions are deleted and the cookie cleared
4. Returns the populated `user` object — `first_name` + `last_name` drive the header username display; `auth_level` drives the Admin nav link

### Post button modal → `POST /posts` → `Post`

`post.controller.js → createPost()` — guarded by `requireSession` middleware

| Source | Field | Schema target |
|---|---|---|
| `req.body` | `content` | `Post.content` (String, required) |
| `req.user._id` (session cookie) | `user_id` | `Post.user_id` (ObjectId ref User, required) |
| `new Date().toISOString()` (server) | `time_stamp` | `Post.time_stamp` (String, required) |
| Server-set | `likes: 0` | `Post.likes` (Number, default 0) |
| Server-set | `comments: []` | `Post.comments` (ObjectId[] ref Comment) |

The `requireSession` middleware runs before the controller: validates the cookie, derives
expiry, and attaches the authenticated user to `req.user`. The controller then reads
`req.user._id` — the client never supplies `user_id` in the body.

### Logout (dropdown) → `DELETE /session` → `Session`

`session.controller.js → logout()`

- `Session.deleteOne({ session_id })` removes the record
- `res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS)` clears the browser cookie
- Idempotent: returns 200 even when no matching session exists

---

## Home Wireframe

### User data panel

Data comes entirely from `GET /session/validate`. No additional endpoint is needed.

| Panel element | Data source |
|---|---|
| Initials avatar | `user.first_name[0] + user.last_name[0]` — derived client-side |
| User status | `user.status` (Boolean: `true` = active) |
| User information | `user.first_name`, `user.last_name`, `user.email`, `user.location`, `user.occupation` |
| Total post count | Count of posts where `post.user_id === user._id` — derived client-side from `GET /posts` |
| Last post date | Max `post.time_stamp` for user's posts — derived client-side from `GET /posts` |

### Post feed (user's own posts) → `GET /posts` → `Post`

`post.controller.js → getAllPosts()`

- `Post.find()` — returns all posts
- Frontend filters to `post.user_id === session.user._id` for the Home view
- Each Post document carries: `_id`, `user_id`, `content`, `time_stamp`, `likes`, `comments[]`

### Comment list → `GET /comments` → `Comment`

`comment.controller.js → getAllComments()`

- `Comment.find()` — returns all comments
- Frontend groups by `comment.post_id` to render each post's comment list
- Each Comment carries: `_id`, `post_id`, `user_id`, `content`, `time_stamp`, `likes`

### Like button → `PATCH /posts/:id` → `Post.likes`

`post.controller.js → updatePost()`

- Whitelisted to `likes` only — `const { likes } = req.body`
- Applied as **`$inc`**: `Post.findByIdAndUpdate(id, { $inc: { likes } }, ...)` — the client
  sends a delta (`+1` or `-1`), and MongoDB atomically increments the stored count. This
  avoids the race condition where two clients read the same stale count and both overwrite it
  with the same absolute value
- Like de-duplication is enforced client-side via `localStorage.likedPosts_${userId}`
  (Issues.md Issue 11 — see `Secret/R_C.md` Section 3)

### Add comment → `POST /comments` → `Comment` + `Post.comments[]`

`comment.controller.js → createComment()` — guarded by `requireSession`

| Source | Field | Schema target |
|---|---|---|
| `req.body` | `content` | `Comment.content` (String, required) |
| `req.body` | `post_id` | `Comment.post_id` (ObjectId ref Post, required) |
| `req.user._id` (session cookie) | `user_id` | `Comment.user_id` (ObjectId ref User, required) |
| `new Date().toISOString()` (server) | `time_stamp` | `Comment.time_stamp` (String, required) |
| Server-set | `likes: 0` | `Comment.likes` (Number, default 0) |

Two writes, kept in sync:

1. `Comment.create(...)` — saves the comment document
2. `Post.findByIdAndUpdate(post_id, { $push: { comments: comment._id } })` — adds the
   comment's `_id` to the parent post's `comments[]` array (two-way link per Issues.md
   Issue 8 — see `Secret/R_C.md` Section 2)

Parent post existence is verified before either write; a missing `post_id` aborts with 404
and no comment is created.

### Edit comment → `PATCH /comments/:id` → `Comment`

`comment.controller.js → updateComment()`

- Builds a targeted update object — only fields present in the body are written:
  - `content` (optional) — updates the comment text
  - `likes` (optional) — updates the comment like count
- `post_id`, `user_id`, and `time_stamp` are permanently immutable; sending them in the body
  has no effect

---

## Bloggs Wireframe

Identical endpoint usage to Home, without the client-side author filter. The full post feed
is sorted newest-first by `time_stamp` on the client.

| Feature | Endpoint | Controller |
|---|---|---|
| Post feed (all users) | `GET /posts` | `getAllPosts` |
| Author initials | `GET /user` | `getAllUsers` (user list resolved client-side by `post.user_id`) |
| Comment list | `GET /comments` | `getAllComments` |
| Like | `PATCH /posts/:id` | `updatePost` (`$inc` delta) |
| Comment | `POST /comments` | `createComment` (requireSession) |

---

## Network Wireframe

### User card grid → `GET /user` → `User`

`user.controller.js → getAllUsers()`

- `User.find().select("-password")` — passwords excluded at the query level
- Returns: `_id`, `first_name`, `last_name`, `email`, `auth_level`, `status`

| Card element | Data source |
|---|---|
| Initials | `first_name[0] + last_name[0]` — derived client-side |
| User information | `first_name`, `last_name`, `email` |
| User status | `status` (Boolean) |
| Most recent post | Latest `time_stamp` post for that `user_id` — taken from `GET /posts`, filtered + sorted client-side |

---

## Admin Wireframe

Access to this view and its nav link is gated entirely by `auth_level === "admin"` from the
`GET /session/validate` response. No `/admin/*` routes exist; the view is composed from the
same shared endpoints.

The Admin view header does not show the Post button.

| Card | Endpoint | Controller | Schema target |
|---|---|---|---|
| User Manager | `GET /user` | `getAllUsers` | `User.*` (password excluded) |
| Content Manager | `GET /posts` | `getAllPosts` | `Post.*` |

Full CRUD for the Admin cards (suspending users, deleting posts) is out of scope for this
module per the spec.

---

## Complete Endpoint → Handler → Schema Map

| Method | Route | Middleware | Controller | Schema writes / reads |
|---|---|---|---|---|
| `POST` | `/user` | — | `createUser` | `User` create |
| `GET` | `/user` | — | `getAllUsers` | `User` read (no password) |
| `GET` | `/user/:id` | — | `getUserById` | `User` read (no password) |
| `POST` | `/session` | — | `login` | `User` read · `Session` create |
| `GET` | `/session/validate` | — | `validate` | `Session` read · `User` populate |
| `DELETE` | `/session` | — | `logout` | `Session` delete |
| `POST` | `/posts` | `requireSession` | `createPost` | `Post` create |
| `GET` | `/posts` | — | `getAllPosts` | `Post` read |
| `PATCH` | `/posts/:id` | — | `updatePost` | `Post.likes` `$inc` |
| `POST` | `/comments` | `requireSession` | `createComment` | `Comment` create · `Post.comments[]` `$push` |
| `GET` | `/comments` | — | `getAllComments` | `Comment` read |
| `PATCH` | `/comments/:id` | — | `updateComment` | `Comment.content` / `Comment.likes` (conditional) |

---

## Notable Implementation Strengths

| Pattern | Where | Why it matters |
|---|---|---|
| `$inc` delta on likes | `updatePost` | Atomic MongoDB increment prevents race conditions from concurrent like requests |
| `requireSession` middleware | `POST /posts`, `POST /comments` | Session validation and identity extraction are centralised — controllers never touch cookies |
| Shared `session.config.js` | `session.controller.js`, `requireSession.js` | `COOKIE_NAME`, `SESSION_TTL`, `COOKIE_OPTIONS` defined once; no drift risk |
| Field whitelist on all write handlers | All controllers | No handler accepts raw `req.body` — mass assignment is structurally impossible |
| Server-generated `time_stamp` | `createPost`, `createComment` | Clients cannot backdate or future-date content |
| Two-way Post ↔ Comment link | `createComment` | `Post.comments[]` + `Comment.post_id` maintained in sync; parent existence verified before either write |
| Password excluded at query level | `getAllUsers`, `getUserById`, `validate` | `.select("-password")` means the hash is never loaded into memory on read paths |
