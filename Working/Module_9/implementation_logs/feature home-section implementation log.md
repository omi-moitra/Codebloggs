# Feature Home Section Implementation Log

## Branch

feature/home-section

## Summary

Implemented the logged-in CodeBloggs Home page experience. The page uses the
existing session user, refreshes the user profile with `GET /user/:id`, fetches
posts with `GET /posts`, fetches comments with `GET /comments`, and filters the
display to posts owned by the logged-in user.

## Files Changed

- `client/src/pages/Home.jsx`
- `client/src/services/apiClient.js`
- `client/src/services/authService.js`
- `client/src/services/postService.js`
- `client/src/services/commentService.js`
- `client/src/services/userService.js`
- `client/src/styles/theme.css`
- `Working/Module_9/implementation_logs/feature home-section implementation log.md`

## Backend Endpoints Used

- `GET /user/:id`
- `GET /posts`
- `GET /comments`
- `PATCH /posts/:id`

## Notes

- The backend stores post dates as `time_stamp`, so the UI reads that field
  first and falls back to `post_date` or `createdAt` if present.
- The backend supports numeric `likes` on posts but does not define `liked_by`,
  so the Home page updates only the `likes` count.
- Comments are fetched from `/comments` and grouped by `post_id` on the client.
