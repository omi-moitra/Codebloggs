# AI Feature Specification - Schema Usage

This feature specification must be used with the Global AI Spec for CodeBloggs.
In this repository, use the current project specs at:

1. `ai/Module_10/ai-spec.md`
2. `ai/Module_9/ai-spec.md`

## Feature Goal

Ensure all backend endpoints use the correct Mongoose schemas for users,
sessions, posts, and comments. Controllers should create, read, update, and
delete documents through the existing schema models in `server/schemas`, while
preserving the API response contract:

```json
{ "status": "ok|error", "data": {}, "message": "Human-readable result" }
```

## Scope

### In Scope

- User schema usage in user and session endpoints.
- Session schema usage in session validation, login, logout, and protected route
  middleware.
- Post schema usage in post endpoints and comment relationship updates.
- Comment schema usage in comment endpoints and cascade cleanup.
- Correct use of `ObjectId` references between User, Session, Post, and Comment.
- Server-owned fields such as password hashes, auth level defaults, status,
  timestamps, likes, and authenticated author IDs.

### Out of Scope

- Adding new database collections.
- Replacing Mongoose or changing schema file locations.
- Adding a new authentication strategy.
- Changing frontend UI behavior.
- Adding post titles; the current `Post` schema stores `content`, `user_id`,
  `likes`, `time_stamp`, and `comments`.
- Moving files from `server/schemas` to `server/models`.

## Requirements Breakdown

### User Schema Usage

- `server/schemas/User.js` defines the User model.
- `server/controllers/user.controller.js` uses `User` for create, read, update,
  and delete operations.
- `server/controllers/session.controller.js` uses `User` during login and status
  updates.
- `server/middleware/requireSession.js` receives populated user data through the
  related Session document.
- Passwords are hashed with bcrypt in the controller before User creation or
  password update.
- Password hashes are excluded from API responses with `delete safeUser.password`
  or `.select("-password")`.
- `auth_level` is set server-side to `"basic"` during registration and should
  not be accepted from registration request bodies.
- User deletion cleans up related posts, comments, replies, sessions, and profile
  pictures.

### Session Schema Usage

- `server/schemas/Session.js` defines the Session model.
- `server/controllers/session.controller.js` creates Session documents on login.
- `session_id` is generated server-side with `crypto.randomUUID()`.
- `session_date` is stored when the session is created.
- Session expiration is derived from `session_date + SESSION_TTL`; no separate
  expiry field is stored.
- `Session.findOne({ session_id })` is used for logout, validation, and
  protected route checks.
- Session validation populates the related User and excludes the password.
- Expired sessions are deleted and the session cookie is cleared.

### Post Schema Usage

- `server/schemas/Post.js` defines the Post model.
- `server/controllers/post.controller.js` uses `Post` for create, read, update,
  and delete operations.
- Creating a post requires a valid session through `requireSession`.
- `user_id` is taken from `req.user._id`, not from request body input.
- `time_stamp` is generated server-side as an ISO string.
- `likes` starts at `0` and `comments` starts as an empty array.
- Post updates are limited to like count changes.
- Deleting a post removes related comments and replies.

### Comment Schema Usage

- `server/schemas/Comment.js` defines the Comment model.
- `server/controllers/comment.controller.js` uses `Comment` for create, read,
  update, and delete operations.
- Creating a comment requires a valid session through `requireSession`.
- `user_id` is taken from `req.user._id`, not from request body input.
- The parent post is verified with `Post.findById(post_id)` before a Comment is
  created.
- After Comment creation, the comment `_id` is pushed into the parent
  `Post.comments` array.
- Deleting a comment pulls the comment `_id` from the parent Post and deletes
  related replies.

## User Flow

### Registration and Login

1. Guest submits registration data to `POST /user`.
2. User controller validates the request, rejects duplicate emails, hashes the
   password, and creates a User document.
3. User logs in through `POST /session`.
4. Session controller finds the User, compares the bcrypt password hash, creates
   a Session document, sets the `session_token` cookie, and marks the User
   status active.

### Authenticated Post Creation

1. Logged-in user sends `POST /posts` with post content.
2. `requireSession` reads the cookie, validates the Session, populates the User,
   and attaches it to `req.user`.
3. Post controller creates a Post with `user_id` from `req.user._id`, a
   server-generated timestamp, zero likes, and no comments.

### Authenticated Comment Creation

1. Logged-in user sends `POST /comments` with `content` and `post_id`.
2. `requireSession` validates the Session and attaches the authenticated User.
3. Comment controller verifies that the parent Post exists.
4. Comment controller creates the Comment and updates the parent Post's
   `comments` array.

### Logout and Validation

1. Client calls `GET /session/validate` to confirm the cookie maps to a live
   Session.
2. Client calls `DELETE /session` to log out.
3. Session controller marks the related User inactive, deletes the Session
   document, clears the cookie, and removes realtime presence state.

## Interfaces Involved

### Pages and Components

- `client/src/pages/Register.jsx`
- `client/src/pages/Login.jsx`
- `client/src/pages/Blogs.jsx`
- `client/src/pages/Admin.jsx`
- `client/src/pages/UserManager.jsx`
- `client/src/pages/ContentManager.jsx`
- `client/src/components/PostModal.jsx`
- `client/src/components/RequireAuth.jsx`
- `client/src/context/AuthContext.jsx`

### Client Services

- `client/src/services/authService.js`
- `client/src/services/userService.js`
- `client/src/services/postService.js`
- `client/src/services/commentService.js`

### Backend Endpoints

- `POST /user`
- `GET /user`
- `GET /user/:id`
- `PATCH /user/:id`
- `DELETE /user/:id`
- `POST /session`
- `GET /session/validate`
- `DELETE /session`
- `POST /posts`
- `GET /posts`
- `PATCH /posts/:id`
- `DELETE /posts/:id`
- `POST /comments`
- `GET /comments`
- `PATCH /comments/:id`
- `DELETE /comments/:id`

### Backend Files

- `server/schemas/User.js`
- `server/schemas/Session.js`
- `server/schemas/Post.js`
- `server/schemas/Comment.js`
- `server/controllers/user.controller.js`
- `server/controllers/session.controller.js`
- `server/controllers/post.controller.js`
- `server/controllers/comment.controller.js`
- `server/middleware/requireSession.js`
- `server/routes/user.routes.js`
- `server/routes/session.routes.js`
- `server/routes/post.routes.js`
- `server/routes/comment.routes.js`

## Data, Validations, and Expected Behavior

### User

- Required fields: `first_name`, `last_name`, `birthday`, `email`, `password`.
- Optional fields: `location`, `occupation`.
- Defaults: `status: false`, `auth_level: "basic"`.
- Email is unique, trimmed, and lowercased by the schema.
- Name, location, and occupation fields are trimmed and length-limited.
- Password must be stored as a bcrypt hash and never returned to clients.
- Duplicate email registration returns `409`.
- Missing or invalid registration fields return `400`.

### Session

- Required fields: `session_id`, `user`.
- Default field: `session_date: Date.now`.
- `user` references the User model.
- Login failure returns the same generic `401` message for unknown emails and bad
  passwords.
- Valid login creates a Session, sets an HTTP-only `session_token` cookie, and
  returns a safe User object.
- Expired or missing sessions return `401`.

### Post

- Required fields: `content`, `user_id`, `time_stamp`.
- Defaults: `likes: 0`, `comments: []`.
- `user_id` references the User model.
- `comments` stores Comment `_id` references.
- Create operations require an authenticated session.
- Malformed or invalid post data returns `400`.
- Missing posts return `404`.

### Comment

- Required fields: `content`, `post_id`, `user_id`, `time_stamp`.
- Default: `likes: 0`.
- `post_id` references the Post model.
- `user_id` references the User model.
- Create operations require an authenticated session.
- Comments cannot be created for missing or malformed parent posts.
- Comment deletion keeps the parent Post `comments` array in sync.

## Acceptance Criteria

- [ ] User endpoints import and use `server/schemas/User.js`.
- [ ] Session endpoints and `requireSession` import and use
      `server/schemas/Session.js`.
- [ ] Post endpoints import and use `server/schemas/Post.js`.
- [ ] Comment endpoints import and use `server/schemas/Comment.js`.
- [ ] Registration creates a User with a hashed password and no returned password
      field.
- [ ] Login creates a Session document linked to the User and sets the
      `session_token` cookie.
- [ ] Session validation rejects missing, unknown, and expired sessions.
- [ ] Authenticated post creation stores `user_id` from the active session.
- [ ] Authenticated comment creation stores `user_id` from the active session,
      verifies `post_id`, and pushes the Comment `_id` onto the parent Post.
- [ ] Deleting users, posts, and comments cleans up related schema-owned data.
- [ ] All schema validation failures return appropriate `400`, `401`, `404`, or
      `409` responses instead of uncaught server errors.
- [ ] API responses follow `{ status, data, message }`.
