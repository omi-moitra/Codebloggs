# Wireframe–Server Discrepancies and Fixes

A complete record of every discrepancy found during the full-stack validation audit
(2026-06-16), comparing the visual wireframe assets (`codebloggs1.png` –
`codebloggs11-newnew.png`), `wireframe-analysis.md`, and the Express/Mongoose server files.

Discrepancies are split into two phases that mirror the audit sequence:
- **Phase 1** — `wireframe-analysis.md` vs the visual wireframe images
- **Phase 2** — Server files vs the corrected `wireframe-analysis.md`

---

## Phase 1 — wireframe-analysis.md vs Visual Assets

---

### P1-1 · Home user panel missing `User Status`

**What was wrong:**
`wireframe-analysis.md` described the Home user-data panel as showing "initials avatar,
total post count, last post date." The Home wireframe image (`codebloggs5-new.png`) clearly
labels three distinct panel elements: Initials, **User Status**, and User Information.
`User Status` was entirely absent from the document; `total post count` and `last post date`
were called out as labelled elements when they are actually contained inside the User
Information block.

**Fix — `wireframe-analysis.md`:**
Updated the Home wireframe DATA section to list the three labelled panel elements (initials
avatar, user status, user information) and clarified that total post count and last post date
are derived client-side and displayed within the user information area.

---

### P1-2 · `liked_by` present in PATCH `/posts/:id` sample but dropped from schema

**What was wrong:**
The `wireframe-analysis.md` PATCH `/posts/:id` sample request and response both included a
`liked_by` array. `Working/Issues.md` Issue 11 (resolved 2026-06-16) had already dropped
`liked_by` from the Post schema in favour of client-side de-duplication via localStorage.
The wireframe samples were never updated to reflect that decision.

**Fix — `wireframe-analysis.md`:**
Removed `liked_by` from the PATCH `/posts/:id` parameters table, sample request, and sample
response. Also removed `"liked_by": []` from the POST `/posts` sample response and
`"liked_by": [...]` from the GET `/posts` sample response.

---

### P1-3 · `User.status` shown as a string in all sample responses

**What was wrong:**
Every sample response in `wireframe-analysis.md` that included a user object showed
`"status": "active"` (a string). `Working/Issues.md` Issue 3 (resolved 2026-06-15) had
already decided `User.status` is a **Boolean** (`true` = active, `false` =
inactive/suspended). The schema diagram image (`codebloggs11-newnew.png`) also showed
`status: str`, compounding the mismatch.

**Fix — `wireframe-analysis.md`:**
Replaced all five occurrences of `"status": "active"` with `"status": true` across the
login, register, validate, and GET `/user` sample responses. Added a contract note in the
intro clarifying that `User.status` is a Boolean and that no `"active"` / `"suspended"`
string exists.

---

### P1-4 · Admin view header missing note about absent Post button

**What was wrong:**
`wireframe-analysis.md` described the Post button as a standard header element present in
every view. The Admin wireframe images (`codebloggs8.png`, `codebloggs9.png`) both show the
header without a Post button. The document gave no indication that the Post button is absent
from the Admin layout.

**Fix — `wireframe-analysis.md`:**
Added a sentence to the Admin wireframe opening paragraph noting that the Admin view header
does not display the Post button and that post creation is not available from the Admin view.

---

## Phase 2 — Server Files vs wireframe-analysis.md

---

### D1 · Post schema and controller missing `title` field

**What was wrong:**
`Working/Issues.md` Issue 5 (resolved 2026-06-15) stated that `title` had been "restored"
to the Post schema. Neither `server/schemas/Post.js` nor `server/controllers/post.controller.js`
contained a `title` field. `wireframe-analysis.md` also carried a schema note calling for
`title` to be added, and the Post Modal wireframe (`codebloggs4.png`) showed a title input.

**Resolution — no title required:**
After review the team confirmed that a post title is not required. `title` was removed
entirely from `wireframe-analysis.md` rather than added to the schema:
- Removed the schema-note blockquote from the intro
- Updated the Post Modal description ("modal with a title field, a text box…" → "modal with
  a text box…")
- Removed `title` from the POST `/posts` parameters table, sample request, and all sample
  responses

No changes were made to the server.

---

### D2 · `user_id` sourced from request body instead of the session cookie

**What was wrong:**
The wireframe contract listed the session cookie — not a body parameter — as the source of
the author's identity for POST `/posts` and POST `/comments`. Both `createPost` and
`createComment` read `user_id` directly from `req.body`, allowing any caller to forge
authorship. There was also no session-validation middleware on either route, so the server
had no mechanism to extract an identity from the cookie even if the controller had tried.

**Fix — server files:**

| File | Change |
|---|---|
| `server/lib/session.config.js` *(new)* | Single source of truth for `COOKIE_NAME`, `SESSION_TTL`, and `COOKIE_OPTIONS` — shared by the controller and the new middleware |
| `server/middleware/requireSession.js` *(new)* | Express middleware that reads and validates the session cookie, checks expiry, and attaches the authenticated user to `req.user`; returns 401 on failure |
| `server/controllers/session.controller.js` | Removed the three duplicated constant declarations; now imports them from `session.config.js` |
| `server/controllers/post.controller.js` | `createPost` reads `user_id` from `req.user._id` (set by middleware); removed from `req.body` destructure |
| `server/controllers/comment.controller.js` | `createComment` reads `user_id` from `req.user._id`; removed from `req.body` destructure |
| `server/routes/post.routes.js` | `POST /posts` now guarded: `router.post("/", requireSession, createPost)` |
| `server/routes/comment.routes.js` | `POST /comments` now guarded: `router.post("/", requireSession, createComment)` |

---

### D3 · `time_stamp` accepted from the request body instead of generated server-side

**What was wrong:**
Both `createPost` and `createComment` read `time_stamp` from `req.body` and stored whatever
the client provided. This allowed callers to supply backdated or future-dated timestamps.
The wireframe contract showed timestamps only in sample *responses*, never as body
parameters — the intent was always server-generated.

**Fix — server files:**

| File | Change |
|---|---|
| `server/controllers/post.controller.js` | Removed `time_stamp` from `req.body` destructure; set `const time_stamp = new Date().toISOString()` server-side |
| `server/controllers/comment.controller.js` | Same — `time_stamp` generated at create time, never accepted from the request body |

---

### D4 · `PATCH /posts/:id` forwarded raw `req.body` to Mongoose (mass assignment)

**What was wrong:**
`updatePost` called `Post.findByIdAndUpdate(req.params.id, req.body, ...)`. Because `req.body`
was passed untouched, any caller could overwrite any Post field — including `content` and
`user_id` — through the like endpoint. The wireframe contract defined only `likes` as a
writable body parameter for this route. Mongoose strict mode does not protect against this
because `content` and `user_id` are valid schema fields.

**Fix — server + R_C.md:**

| File | Change |
|---|---|
| `server/controllers/post.controller.js` | `updatePost` now extracts only `const { likes } = req.body` and passes `{ likes }` to `findByIdAndUpdate`; all other body keys are ignored |
| `Secret/R_C.md` | Added Section 5: "Field Whitelisting on PATCH Routes and the Mass Assignment Problem" — covers what mass assignment is, why strict mode is not sufficient, the before/after fix pattern, and a cross-handler reference table |

---

### D5 · Timestamp field names in wireframe samples did not match schema field names

**What was wrong:**
`wireframe-analysis.md` sample responses used `"post_date"` on Post objects and `"date"` on
Comment objects. The actual schemas (`Post.js`, `Comment.js`) both use `time_stamp` — a
decision made in `Working/Issues.md` Issue 7 (resolved 2026-06-15) that was never reflected
in the wireframe samples. Any frontend built from the samples would read `undefined` for
every timestamp.

**Fix — `wireframe-analysis.md` + R_C.md:**

All stale field names replaced:

| Location | Old | New |
|---|---|---|
| POST `/posts` sample response | `"post_date"` | `"time_stamp"` |
| GET `/posts` sample response | `"post_date"` | `"time_stamp"` |
| GET `/comments` sample response | `"date"` | `"time_stamp"` |
| POST `/comments` sample response | `"date"` | `"time_stamp"` |
| Bloggs section prose | "sorted by `post_date`" | "sorted by `time_stamp`" |
| Network section prose | "most recent post (by `post_date`)" | "most recent post (by `time_stamp`)" |
| Intro snake_case example | `` `post_date` `` | `` `time_stamp` `` |

`Secret/R_C.md` Section 4 added: "Timestamp Field Naming: `time_stamp` vs `post_date` /
`date`" — explains the consistency rationale, why String was chosen over Date, how
`session_date` differs (internal Date, never client-facing), and the frontend impact.

---

### D6 · `PATCH /comments/:id` existed in the server but was undocumented in the wireframe

**What was wrong:**
`comment.routes.js` and `comment.controller.js` implemented a `PATCH /comments/:id` endpoint,
but `wireframe-analysis.md` contained no mention of it anywhere. There was no contract, no
parameter documentation, and no corresponding UI action described.

**Fix — `wireframe-analysis.md`:**
Added **Action C — Edit a comment** to the Home wireframe ACTIONS section immediately after
Action B (Add a comment). Documents the route (`PATCH /comments/{id}`), the session cookie
parameter, optional `content` and `likes` body parameters, a sample request, and a sample
response.

---

### D7 · Comment `likes` field in schema had no corresponding API endpoint

**What was wrong:**
`server/schemas/Comment.js` defined a `likes: Number` field, but no route or controller
action allowed it to be updated. The `updateComment` controller explicitly ignored `likes`,
allowing only `content` to be changed. The field was stored in every comment document but
was permanently frozen at `0`.

**Fix — server:**

| File | Change |
|---|---|
| `server/controllers/comment.controller.js` | `updateComment` now builds a targeted update object: `if (req.body.content !== undefined) update.content = ...` and `if (req.body.likes !== undefined) update.likes = ...`. Both fields are optional; neither `post_id`, `user_id`, nor `time_stamp` can be changed. |

The `PATCH /comments/:id` documentation added in D6 reflects both `content` and `likes` as
optional writable fields.

---

## Summary Table

| ID | Source | Description | Affected files | Status |
|----|--------|-------------|----------------|--------|
| P1-1 | Wireframe vs image | Home user panel missing `User Status` label | `wireframe-analysis.md` | Resolved |
| P1-2 | Wireframe vs schema decision | `liked_by` in PATCH sample — field was dropped | `wireframe-analysis.md` | Resolved |
| P1-3 | Wireframe vs schema decision | `User.status` shown as string; schema uses Boolean | `wireframe-analysis.md` | Resolved |
| P1-4 | Wireframe vs image | Admin view Post button absence undocumented | `wireframe-analysis.md` | Resolved |
| D1 | Server vs wireframe | Post schema missing `title` — resolved as not required | `wireframe-analysis.md` | Resolved (title removed) |
| D2 | Server vs wireframe | `user_id` from body; no session guard on write routes | `session.config.js`, `requireSession.js`, `post.controller.js`, `comment.controller.js`, `post.routes.js`, `comment.routes.js`, `session.controller.js` | Resolved |
| D3 | Server vs wireframe | `time_stamp` accepted from client; should be server-generated | `post.controller.js`, `comment.controller.js` | Resolved |
| D4 | Server vs wireframe | Raw `req.body` forwarded to Mongoose — mass assignment risk | `post.controller.js`, `R_C.md` | Resolved |
| D5 | Wireframe vs schema decision | `post_date` / `date` in samples; schema uses `time_stamp` | `wireframe-analysis.md`, `R_C.md` | Resolved |
| D6 | Server vs wireframe | `PATCH /comments/:id` implemented but undocumented | `wireframe-analysis.md` | Resolved |
| D7 | Server vs wireframe | Comment `likes` field stored but no endpoint to update it | `comment.controller.js` | Resolved |
