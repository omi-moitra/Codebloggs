# Feature Social Interactions Implementation Log

## Branch

- Started from `client`.
- Created and implemented on `feature/social-interactions`.

## Audit Performed Before Coding

Inspected required frontend files:

- `client/src/pages/Home.jsx`
- `client/src/pages/Blogs.jsx`
- `client/src/services/postService.js`
- `client/src/services/commentService.js`
- `client/src/context/AuthContext.jsx`

Read-only backend/API confirmation:

- `server/routes/post.routes.js`
- `server/controllers/post.controller.js`
- `server/routes/comment.routes.js`
- `server/controllers/comment.controller.js`
- `server/schemas/Post.js`
- `server/schemas/Comment.js`
- `ai/features/post-endpoint.feature.md`
- `ai/features/comment-endpoint.feature.md`

Data model note:

- `EDD.md` still describes the original employee-records sample app, not CodeBloggs posts/comments.
- CodeBloggs post/comment shapes were confirmed from the current frontend services, feature specs, and read-only backend files.

## Backend Capabilities Discovered

Posts:

- Existing consumed endpoints:
  - `GET /posts`
  - `POST /posts`
  - `PATCH /posts/:id`
- `PATCH /posts/:id` increments the numeric `likes` count using `$inc`.
- Posts do not store `liked_by`, a per-user like relation, or any server-side true liked/unliked state.

Comments:

- Existing consumed endpoints before this feature:
  - `GET /comments`
  - `POST /comments`
- Existing backend endpoint available but not previously consumed by the frontend:
  - `PATCH /comments/:id`
- `PATCH /comments/:id` supports incrementing the numeric `likes` count using a `likes` delta.
- Comments do not store `liked_by`, a per-user like relation, or any server-side true liked/unliked state.

Replies:

- No reply schema field was found.
- No reply endpoint was found.
- Existing comment documents only support `content`, `post_id`, `user_id`, `likes`, and `time_stamp`.

## Backend Limitations

- Post Like / Unlike cannot be fully authoritative because the backend only stores a total count.
- Comment Like / Unlike cannot be fully authoritative because the backend only stores a total count.
- The frontend cannot know from the API whether the current user has already liked a post or comment.
- Reply persistence is unavailable. Replies cannot be saved, fetched, or shared across sessions without backend changes.

## Implementation

Post Like / Unlike:

- Added reversible Like / Unlike behavior on Home and Blogs.
- Uses existing `PATCH /posts/:id` with `+1` and `-1` deltas.
- Added local per-user/per-post liked-state in `localStorage` so the button can visually reflect the current browser user's action.
- Like count updates from the backend response when available, with a local fallback.

Comment Likes:

- Added `updateCommentLikes(commentId, likes)` in `client/src/services/commentService.js`.
- Added comment Like / Unlike buttons on Home and Blogs.
- Uses existing `PATCH /comments/:id` with `+1` and `-1` deltas.
- Displays comment like counts from the comment document.
- Uses local per-user/per-comment liked-state for visual toggle state.

Reply To Comment:

- Added Reply buttons beneath comments on Home and Blogs.
- Clicking Reply reveals a nested reply form.
- Submitted replies render visually nested beneath the parent comment.
- Replies are frontend-only in page state because no backend support exists.

Styling:

- Added shared social action and nested reply styles in `client/src/styles/theme.css`.
- Preserved the existing CodeBloggs theme and card/list structure.

## Files Changed

- `client/src/pages/Home.jsx`
- `client/src/pages/Blogs.jsx`
- `client/src/services/commentService.js`
- `client/src/services/socialInteractionService.js`
- `client/src/styles/theme.css`
- `Working/Module_9/implementation_logs/feature social-interactions implementation log.md`

## Verification

- `npm run build` from `client/`: passed.
- `git diff --check`: passed.
- Started Vite dev server at `http://127.0.0.1:3000/`.
- `curl -I http://127.0.0.1:3000/`: returned `HTTP/1.1 200 OK`.
- In-app browser visual verification was attempted, but the configured `iab` browser was unavailable in this session.

## Remaining Limitations

- Local liked-state can be lost if browser storage is cleared or if the same user uses another browser/device.
- Like totals can still drift in edge cases because the backend does not enforce one-like-per-user.
- Frontend-only replies disappear on page refresh and are not visible to other users.
- Full reply support requires backend schema and route/controller changes, which were intentionally not made for this frontend-only task.
