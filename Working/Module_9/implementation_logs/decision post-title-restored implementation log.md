# Decision Log — Post `title` Field Restored

## Date

2026-06-15

## Decision

Add `title` back to the Post schema and all backend specs that reference Post fields.

## Why

During a cross-check of `ai/features/post-endpoint.feature.md` against the Working folder,
`Working/MOD 9.md` line 416 was found to explicitly describe the Post Modal as containing
**a title field**:

> *"When clicking on the Post button, this should bring up a modal that will contain a
> title, a text box, and a button to Post."*

`title` had previously been dropped as part of Issue 5 (`Working/Issues.md`). That drop
was reversed because the MOD 9.md description is part of the graded deliverable and the
Post Modal wireframe requires a title.

## Files Affected and How

### `ai/features/schemas.feature.md`

- **Sub-Requirements section:** `title` added to the Post schema bullet:
  `_id`, **`title`**, `content`, `user_id`, `likes`, `time_stamp`, `comments[]`.
- **Post schema table:** new row inserted — `title | String | yes | — | post title (from Post Modal wireframe)`.
- **Acceptance Criteria:** checklist item updated to include `title`.

### `ai/features/post-endpoint.feature.md`

- **Intro ⚠️ note:** updated to reflect that `title` is restored and only `liked_by` and
  the Date→String change remain as deviations.
- **Sub-Requirements:** `title` added to the Create post bullet.
- **User Flow — Create Post step 1:** `title` added to the request shape `{ title, content, user_id, time_stamp }`.
- **POST /posts body parameters table:** `title | String | yes | Post title` row added.
- **POST /posts sample request:** `"title": "My first post"` added.
- **POST /posts sample response (201):** `"title": "My first post"` added to post object.
- **PATCH /posts/:id sample response (200):** `"title": "My first post"` added to post object.
- **GET /posts sample response (200):** `"title": "My first post"` added to post object.
- **Tech Constraints:** removed the `⚠️` note that said `title` was dropped and to ignore it.
- **Notes for AI:** removed the instruction telling AI not to store or return `title`.

### `Working/Issues.md`

- **Issue 5 summary table:** Decision cell updated to show `title` restored;
  `liked_by` still dropped. Status updated to note the 2026-06-15 revision.
- **Issue 5 detail section:** Decision paragraph rewritten — `title` restored per MOD 9.md
  line 416; `liked_by` dropped note retained.

## Files NOT Affected

- `ai/features/configuration.feature.md` — infrastructure only; no Post fields.
- `ai/features/session-endpoint.feature.md` — no Post fields.
- `ai/features/user-endpoint.feature.md` — no Post fields.
- `ai/features/schemas.feature.md` — Comment, User, Session schemas unchanged.

## Downstream Impact

Any frontend spec or implementation that renders posts must include `title` as a displayed
field. The Post Modal must send `title` in the `POST /posts` request body. The Post API
controller must save and return `title`.
