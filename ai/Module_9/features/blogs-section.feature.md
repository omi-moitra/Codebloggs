# 🤖 AI_FEATURE_Blogs-Section

---

## Feature Identity

- **Feature Name:** Blogs Section
- **Related Area:** Frontend

---

## Feature Goal

The Blogs Section displays a global feed of posts from all users. It allows logged-in users to view posts across the CodeBloggs network, see who created each post through user initials, and read comments connected to each post.

---

## Feature Scope

### In Scope (Included)

- Display all posts from the Post collection.
- Sort posts with the most recent post first.
- Display each post’s content/message.
- Display each post’s date.
- Display each post’s like count.
- Display user initials for the creator of each post.
- Display comments associated with each post.
- Allow logged-in users to create comments on posts when the backend supports `POST /comments`.
- Fetch users, posts, and comments from existing backend endpoints.
- Include loading, empty, and error states.
- Preserve existing protected route and layout structure.

### Out of Scope (Excluded)

- Creating new posts.
- Editing or deleting posts.
- Editing or deleting comments.
- Admin-only functionality.
- Network user cards.
- Home profile summary.
- Backend schema changes.
- Backend endpoint creation.
- Global Post Modal functionality.

---

## Sub-Requirements (Feature Breakdown)

- **Requirement A — Global Post List**  
  The Blogs page must display posts from all users.

- **Requirement B — Newest First Sorting**  
  Posts must be sorted so the most recent post appears first.

- **Requirement C — User Initials on Posts**  
  Each post must show a stylized initials avatar for the user who created the post.

- **Requirement D — Post Content**  
  Each post must display its message/body content clearly.

- **Requirement E — Post Date**  
  Each post must display a readable date.

- **Requirement F — Post Likes**  
  Each post must display the current number of likes.

- **Requirement G — Post Comments**  
  Each post must display comments associated with that specific post.

- **Requirement H — Add Comment**
  Each post must provide a comment form that sends `post_id` and comment content to the existing comment creation endpoint.

- **Requirement I — Loading, Empty, and Error States**
  The Blogs page must clearly handle loading, no posts, and failed API requests.

---

## User Flow / Logic (High Level)

1. Logged-in user navigates to `/blogs`.
2. The page loads inside the protected `MainLayout`.
3. The frontend fetches posts, users, and comments from the backend.
4. Posts are sorted newest first.
5. Each post is matched with its author.
6. Each post is matched with its related comments.
7. The page renders a global feed of post cards.
8. If the user submits a comment, the frontend sends it to the backend and updates the visible comment list after success.
9. If no posts exist, the user sees an empty state.
10. If data cannot be fetched, the user sees an error state.

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/src/pages/Blogs.jsx`
- `client/src/services/postService.js`
- `client/src/services/commentService.js`
- `client/src/services/userService.js`
- `client/src/styles/theme.css`
- Existing `MainLayout`, `Header`, and `Sidebar`

### Backend / API

Use existing backend routes only. Confirm exact response shapes before coding.

Expected related endpoints:

- `GET /posts` — retrieve all posts
- `GET /comments` — retrieve all comments
- `POST /comments` — create a comment
- `GET /user` or `GET /users` — retrieve users if needed for author initials
- `PATCH /posts/:id` — update post likes only if already supported

---

## Data Used or Modified

This feature reads:

- **Post data**
  - `_id`
  - `user_id`
  - post text/body/message
  - `likes`
  - `createdAt`

- **User data**
  - `_id`
  - `first_name`
  - `last_name`

- **Comment data**
  - `_id`
  - `post_id`
  - `user_id`
  - comment text/body/message
  - `createdAt`

This feature may update post likes and create comments only if the existing backend routes support those actions.

---

## Tech Constraints (Feature-Level)

- Must preserve existing authentication and protected routing.
- Must not modify backend code.
- Must not create new backend endpoints.
- Must not change schemas.
- Must use existing service structure where possible.
- Must follow the CodeBloggs theme and existing layout.
- Must not duplicate Home page logic unnecessarily.
- Must not add unsupported fields such as `liked_by`.
- Must not add a post title field unless the backend schema explicitly requires it.

---

## Acceptance Criteria

- [ ] `/blogs` remains protected.
- [ ] Authenticated users can access `/blogs`.
- [ ] Blogs page displays posts from all users.
- [ ] Posts appear newest first.
- [ ] Each post displays user initials.
- [ ] Each post displays post content.
- [ ] Each post displays a readable date.
- [ ] Each post displays like count.
- [ ] Each post displays associated comments.
- [ ] Each post allows a logged-in user to add a comment through `POST /comments`.
- [ ] Loading state appears while data is fetching.
- [ ] Empty state appears when no posts exist.
- [ ] Error state appears when data cannot be fetched.
- [ ] Existing layout, header, sidebar, auth, and routing remain working.
- [ ] `npm run build` passes.
- [ ] `git diff --check` passes.
- [ ] An implementation log is created for this feature.

---

## Notes for the AI

- Read `ai/ai-spec.md` before implementing.
- Use this feature spec together with the global AI spec.
- Inspect the current Home Section implementation before coding to reuse service patterns where appropriate.
- Keep this feature focused only on the Blogs page.
- Do not implement the Post Modal in this feature.
- Do not refactor authentication or layout code.
- If backend response shapes differ from this spec, adapt the frontend to the actual backend and document the difference in the final report.
