# Wireframe Analysis

This document analyzes each CodeBloggs wireframe and answers two questions per screen:

1. **DATA** — What data, if any, is required from the backend to render the wireframe?
2. **ACTIONS** — What actions, if any, is the wireframe responsible for?

Where dynamic data or actions are required, the relevant API endpoint is documented
(HTTP method, route, parameters, and a sample response). Where they are not, this is
stated explicitly.

This analysis follows the contract defined in [`ai/ai-spec.md`](ai/ai-spec.md):

- **Auth is cookie-based session, not bearer/JWT.** Logging in creates a **Session** and
  sets a session cookie; that cookie is sent automatically on every subsequent request, so
  protected routes do **not** take an `Authorization` header. The session is validated on
  every page via `GET /session/validate`.
- **API routes** are `/session`, `/user`, `/posts`, and `/comments` (see the project map
  in the spec). There are no `/auth/*`, `/network`, or `/admin/*` routes.
- **Response shape** is always `{ status, data, message }`.
- **Field names use snake_case** (`first_name`, `last_name`, `auth_level`, `time_stamp`),
  matching the schemas in the spec. Authorization level is `auth_level` with values
  `"basic"` | `"admin"` (there is no `role` field). Passwords are never returned.
- **`User.status` is a Boolean** (`true` = active, `false` = inactive/suspended); sample
  responses reflect this — there is no `"active"` / `"suspended"` string value.

> Base URL used in examples: `http://localhost:5050`

---

## Login / Registration Wireframe

The first screen the user sees. Login is shown first; clicking *"Not a member? Register
Now"* switches to the Registration page. Both screens read from and write to the **User**
collection in MongoDB. Per the spec, these pages render in a standalone layout (no header
or navbar).

### 1. DATA

**NO dynamic data is required to render this wireframe.**

The login and registration forms are static. They display input fields (and the link to
switch between the two views) without fetching anything from the backend on load.

### 2. ACTIONS — **YES**

This wireframe is responsible for two actions: **submitting a login** and **submitting a
registration**.

#### Action A — Log in

##### Route

```
POST /session
```

Creates a Session for the user and sets the session cookie on the response.

##### Parameters

| TYPE | NAME | DESCRIPTION |
| ----- | ----- | ----- |
| Body | email | The user's email address |
| Body | password | The user's password (compared against the bcrypt hash) |

##### Sample Request

```json
{
  "email": "jane@codebloggs.dev",
  "password": "S3curePass!"
}
```

##### Sample Response

```json
{
  "status": "ok",
  "data": {
    "user": {
      "_id": "user-001",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane@codebloggs.dev",
      "auth_level": "basic",
      "status": true
    }
  },
  "message": "Login successful"
}
```

> The session token is delivered as an HTTP cookie (set by the server), not in the response
> body. The client stores/reads it via `react-use-cookie`.

#### Action B — Register

##### Route

```
POST /user
```

Creates a new user. New users default to `auth_level = "basic"`. The password is hashed
with bcrypt before storage.

##### Parameters

| TYPE | NAME | DESCRIPTION |
| ----- | ----- | ----- |
| Body | first_name | The user's first name |
| Body | last_name | The user's last name |
| Body | birthday | The user's date of birth (date-picker; required) |
| Body | email | The user's email address (must be unique) |
| Body | password | The user's chosen password |
| Body | location | The user's location |
| Body | occupation | The user's occupation |

##### Sample Request

```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "birthday": "1995-12-01",
  "email": "jane@codebloggs.dev",
  "password": "S3curePass!",
  "location": "Florida",
  "occupation": "Developer"
}
```

##### Sample Response

```json
{
  "status": "ok",
  "data": {
    "user": {
      "_id": "user-001",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane@codebloggs.dev",
      "auth_level": "basic",
      "status": true
    }
  },
  "message": "Registration successful. Please log in."
}
```

After a successful registration, the user is returned to the Login page.

---

## Main / Post Modal Wireframe

After login, the user lands on the Main page (Home). The layout contains a **Header**
(logo, header text, a Post button, and a username display) and a **left-side navigation**
(Home, Bloggs, Network, and — for admins only — Admin). The username display is a dropdown
with **Account Settings** and **Logout**. Clicking the **Post** button opens a modal with a
text box and a Post button.

### 1. DATA — **YES**

The header needs the logged-in user's name to render the username display, and the app must
confirm there is a valid session. Both come from validating the session cookie. The logo
and header text are provided/static and require no backend data.

##### Route

```
GET /session/validate
```

Validates the current session cookie (token/expiration) and returns the associated user.
Called on every page; if it fails, the app shows the Login page.

##### Parameters

| TYPE | NAME | DESCRIPTION |
| ----- | ----- | ----- |
| Cookie | session token | Sent automatically by the browser; identifies the session |

##### Sample Response

```json
{
  "status": "ok",
  "data": {
    "user": {
      "_id": "user-001",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane@codebloggs.dev",
      "auth_level": "basic",
      "status": true
    }
  },
  "message": "Session is valid"
}
```

> The `auth_level` returned here is what gates the Admin nav link (shown only when
> `auth_level === "admin"`).

### 2. ACTIONS — **YES**

This wireframe is responsible for: **creating a post** (Post modal), **logging out**, and
**navigation** (Home / Bloggs / Network / Admin — client-side routing only, no API).

#### Action A — Create a post

##### Route

```
POST /posts
```

##### Parameters

| TYPE | NAME | DESCRIPTION |
| ----- | ----- | ----- |
| Cookie | session token | Identifies the author (sent automatically) |
| Body | content | The post body text |

##### Sample Request

```json
{
  "content": "Hello CodeBloggs! Excited to be here."
}
```

##### Sample Response

```json
{
  "status": "ok",
  "data": {
    "post": {
      "_id": "post-101",
      "user_id": "user-001",
      "content": "Hello CodeBloggs! Excited to be here.",
      "time_stamp": "2026-06-15T14:30:00Z",
      "likes": 0
    }
  },
  "message": "Post created successfully"
}
```

#### Action B — Log out

##### Route

```
DELETE /session
```

Ends the session and clears the session cookie.

##### Parameters

| TYPE | NAME | DESCRIPTION |
| ----- | ----- | ----- |
| Cookie | session token | The session to end (sent automatically) |

##### Sample Response

```json
{
  "status": "ok",
  "data": {},
  "message": "Logged out successfully"
}
```

> **Account Settings** only shows a confirmation toast (full account editing is out of
> scope per the spec). The left-nav links (Home / Bloggs / Network / Admin) are handled by
> client-side routing and do not require their own API calls to navigate.

---

## Home Wireframe

After a successful login the user is brought to the Home page. It contains two main
elements: a panel with **User data** (initials avatar, user status, and user information),
and a **list of Post components** authored by the logged-in user. Each post has Content, a
Post Date, a Like button with a like count, and a Comments list.

### 1. DATA — **YES**

The page needs the logged-in user's identity (from `GET /session/validate`, see the
**Main / Post Modal** wireframe) and the full set of posts and comments. The user-data card
fields — initials avatar, **user status**, and **user information** — come from the session
user object. Total post count and last post date are derived client-side from the logged-in
user's posts and displayed within the user information area.

> The spec defines `GET /posts` as "get all posts" (there is no author-filter query
> endpoint). The Home view fetches all posts and filters to the logged-in user's
> `user_id` client-side; comments are matched to each post by `post_id`.

#### Route — All posts

```
GET /posts
```

##### Parameters

_None._ Returns all posts.

##### Sample Response

```json
{
  "status": "ok",
  "data": {
    "posts": [
      {
        "_id": "post-101",
        "user_id": "user-001",
        "content": "Hello CodeBloggs! Excited to be here.",
        "time_stamp": "2026-06-15T14:30:00Z",
        "likes": 4
      }
    ]
  },
  "message": "Posts retrieved successfully"
}
```

#### Route — All comments

```
GET /comments
```

##### Parameters

_None._ Returns all comments; the UI groups them by `post_id`.

##### Sample Response

```json
{
  "status": "ok",
  "data": {
    "comments": [
      {
        "_id": "comment-1",
        "post_id": "post-101",
        "user_id": "user-014",
        "content": "Welcome aboard!",
        "time_stamp": "2026-06-15T15:00:00Z"
      }
    ]
  },
  "message": "Comments retrieved successfully"
}
```

### 2. ACTIONS — **YES**

Each post supports **liking** and **commenting**.

#### Action A — Like a post

Likes are a field on the Post, updated via the post-update route (there is no dedicated
like sub-route in the spec).

##### Route

```
PATCH /posts/{id}
```

##### Parameters

| TYPE | NAME | DESCRIPTION |
| ----- | ----- | ----- |
| Path | id | Id of the post being liked |
| Cookie | session token | Identifies the user (sent automatically) |
| Body | likes | The updated like count |

##### Sample Request

```json
{
  "likes": 5
}
```

##### Sample Response

```json
{
  "status": "ok",
  "data": {
    "post": {
      "_id": "post-101",
      "likes": 5
    }
  },
  "message": "Post updated successfully"
}
```

#### Action B — Add a comment

##### Route

```
POST /comments
```

##### Parameters

| TYPE | NAME | DESCRIPTION |
| ----- | ----- | ----- |
| Cookie | session token | Identifies the commenter (sent automatically) |
| Body | post_id | Id of the post being commented on |
| Body | content | The comment text |

##### Sample Request

```json
{
  "post_id": "post-101",
  "content": "Great first post!"
}
```

##### Sample Response

```json
{
  "status": "ok",
  "data": {
    "comment": {
      "_id": "comment-2",
      "post_id": "post-101",
      "user_id": "user-001",
      "content": "Great first post!",
      "time_stamp": "2026-06-15T16:10:00Z"
    }
  },
  "message": "Comment added successfully"
}
```

#### Action C — Edit a comment

Allows the author to update the text of an existing comment, or update its like count.
`post_id`, `user_id`, and `time_stamp` are fixed at creation and cannot be changed.

##### Route

```
PATCH /comments/{id}
```

##### Parameters

| TYPE | NAME | DESCRIPTION |
| ----- | ----- | ----- |
| Path | id | Id of the comment to update |
| Cookie | session token | Identifies the requester (sent automatically) |
| Body | content | (optional) The updated comment text |
| Body | likes | (optional) The updated like count |

> At least one of `content` or `likes` should be provided; sending neither results in a no-op update.

##### Sample Request

```json
{
  "content": "Updated comment text!"
}
```

##### Sample Response

```json
{
  "status": "ok",
  "data": {
    "comment": {
      "_id": "comment-2",
      "post_id": "post-101",
      "user_id": "user-001",
      "content": "Updated comment text!",
      "likes": 0,
      "time_stamp": "2026-06-15T16:10:00Z"
    }
  },
  "message": "Comment updated successfully"
}
```

---

## Bloggs Wireframe

The Bloggs page shows a list of Blog Post components from across the platform (not limited
to the logged-in user), **most recent first**. Each Blogg Post is structured like the Post
component, with comments and author initials.

### 1. DATA — **YES**

The page needs the full feed of posts from all users (plus comments to render each post's
comment list). It uses the same endpoints as Home, without the client-side author filter;
posts are sorted newest-first by `time_stamp`.

##### Route

```
GET /posts
```

(Same endpoint and sample response as documented under the **Home** wireframe. Comments
come from `GET /comments`, grouped by `post_id`. Author initials are derived from each
post's `user_id`, resolved against the user list — see **Network**, `GET /user`.)

### 2. ACTIONS — **YES**

Identical to the Home wireframe: each blog post supports **liking** and **commenting**.

- Like — `PATCH /posts/{id}`
- Comment — `POST /comments`

(See the **Home Wireframe** section for full parameter tables and sample responses.)

---

## Network Wireframe

Clicking the Network nav link opens the Network View, a list of **User Cards**. Each User
Card shows the user's initials, user information, user status, and that user's latest post.

### 1. DATA — **YES**

The page needs the list of users and their posts. There is no dedicated `/network`
endpoint in the spec; the view is composed from `GET /user` (all users) and `GET /posts`
(to find each user's latest post). Status is the user's account `status`; initials are
derived from `first_name` / `last_name`.

##### Route — All users

```
GET /user
```

##### Parameters

| TYPE | NAME | DESCRIPTION |
| ----- | ----- | ----- |
| Cookie | session token | Identifies the logged-in user (sent automatically) |

##### Sample Response

```json
{
  "status": "ok",
  "data": {
    "users": [
      {
        "_id": "user-014",
        "first_name": "Frank",
        "last_name": "Chen",
        "email": "frank@codebloggs.dev",
        "auth_level": "basic",
        "status": true
      },
      {
        "_id": "user-020",
        "first_name": "Grace",
        "last_name": "Patel",
        "email": "grace@codebloggs.dev",
        "auth_level": "basic",
        "status": true
      }
    ]
  },
  "message": "Users retrieved successfully"
}
```

> The "latest post" shown on each card is the most recent post (by `time_stamp`) for that
> `user_id`, taken from `GET /posts`. The card's status is the user's account `status`
> (e.g., `active` / `suspended`) — there is no follow/connection state, as
> following/friend-request systems are out of scope per the spec.

### 2. ACTIONS

**NO actions are required by the wireframe as described.** The Network View only renders a
list of User Cards. Following/connect interactions are explicitly out of scope per the
spec, so no connect endpoint is defined.

---

## Admin Wireframe

The Admin View contains two cards: a **User Manager** and a **Content Manager**. The Admin
View — and its nav link — must be hidden from users whose `auth_level` is not `"admin"`.
The Admin view header does not display the **Post** button; post creation is not available
from the Admin view.

> **Scope note:** per the spec, the Admin cards are **layout-level for this module** — full
> User/Content Manager CRUD is out of scope. The data below reuses the existing `/user` and
> `/posts` routes; there are no `/admin/*` endpoints.

### 1. DATA — **YES**

The view is gated by the logged-in user's `auth_level` (from `GET /session/validate`), and
each manager card needs its own list.

#### Route — Users (User Manager)

```
GET /user
```

Returns all users (same endpoint and sample response as the **Network** wireframe).

#### Route — Content (Content Manager)

```
GET /posts
```

Returns all posts (same endpoint and sample response as the **Home** wireframe).

### 2. ACTIONS

**NO actions are required by the wireframe for this module.**

The Admin cards are layout-level only. Full User Manager / Content Manager CRUD
(updating roles, suspending users, deleting posts, etc.) is **out of scope** per the spec,
so no update/delete endpoints are defined here.

> If admin CRUD is added in a later module, it would be backed by the existing resource
> routes — e.g., `PATCH /user/{id}` to change a user's `status`/`auth_level`. This is not
> part of the current wireframe.
