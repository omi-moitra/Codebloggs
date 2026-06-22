# Feature Blogs Section Implementation Log

## Branch

feature/blogs-section

## Summary

Implemented the protected Blogs page as a global CodeBloggs feed. The page fetches
all posts, comments, and users, sorts posts newest first, matches each post to
its author, and groups comments under their related post.

## Files Changed

- `client/src/pages/Blogs.jsx`
- `client/src/services/userService.js`
- `client/src/styles/theme.css`
- `Working/Module_9/implementation_logs/feature blogs-section implementation log.md`

## Backend Endpoints Used

- `GET /posts`
- `GET /comments`
- `GET /user`
- `PATCH /posts/:id`

## Notes

- The backend uses singular `GET /user` for all users.
- Posts and comments store dates in `time_stamp`, so the UI reads that first
  and falls back to `post_date` or `createdAt` if present.
- The backend supports numeric `likes` on posts through `PATCH /posts/:id`.
  There is no `liked_by` support, so the page only updates the likes count.
- No backend schema or route changes were made.
