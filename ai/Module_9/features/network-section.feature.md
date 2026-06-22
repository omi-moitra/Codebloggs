# 🤖 AI_FEATURE_Network-Section

---

## Feature Identity

- **Feature Name:** Network Section
- **Related Area:** Frontend

---

## Feature Goal

The Network Section displays a directory of CodeBloggs users so logged-in users can browse the developer community. Each user should appear as a card with key profile information and that user’s latest post if one exists.

---

## Feature Scope

### In Scope (Included)

- Display a list of user cards on `/network`.
- Fetch user data from the existing backend endpoint.
- Fetch post data to identify each user’s latest post.
- Display each user’s name and available profile details.
- Display stylized user initials.
- Display the user’s latest post if one exists.
- Show a clear fallback message if a user has not posted yet.
- Include loading, empty, and error states.
- Preserve existing protected route and layout structure.

### Out of Scope (Excluded)

- Creating new users.
- Editing user profiles.
- Deleting users.
- Following/unfollowing users.
- Messaging users.
- Admin controls.
- Creating, editing, or deleting posts.
- Creating, editing, or deleting comments.
- Backend schema changes.
- Backend endpoint creation.

---

## Sub-Requirements (Feature Breakdown)

- **Requirement A — User Card List**  
  The Network page must display a list of users as individual cards.

- **Requirement B — Card Content**  
  Each user card must display key user information such as name, location, occupation, auth level, or status when available.

- **Requirement C — User Initials**  
  Each user card must include a stylized initials avatar based on the user’s first and last name.

- **Requirement D — Latest Post Preview**  
  Each user card must show that user’s latest post if one exists.

- **Requirement E — No Post Fallback**  
  If a user has no posts, the card must display a friendly fallback message.

- **Requirement F — Loading, Empty, and Error States**  
  The Network page must handle loading, no users, and failed API requests clearly.

---

## User Flow / Logic (High Level)

1. Logged-in user navigates to `/network`.
2. The page loads inside the protected `MainLayout`.
3. The frontend fetches all users.
4. The frontend fetches all posts.
5. Posts are grouped by user.
6. For each user, the frontend identifies the most recent post.
7. The page renders one card per user.
8. Each card shows profile info and latest post preview.
9. If no users exist, the page shows an empty state.
10. If data cannot load, the page shows an error state.

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/src/pages/Network.jsx`
- `client/src/services/userService.js`
- `client/src/services/postService.js`
- `client/src/styles/theme.css`
- Existing `MainLayout`, `Header`, and `Sidebar`

### Backend / API

Use existing backend routes only. Confirm actual paths before coding.

Expected related endpoints:

- `GET /user` — retrieve all users
- `GET /posts` — retrieve all posts

---

## Data Used or Modified

This feature reads:

- **User data**
  - `_id`
  - `first_name`
  - `last_name`
  - `email`
  - `location`
  - `occupation`
  - `auth_level`
  - `status`

- **Post data**
  - `_id`
  - `user_id`
  - post text/body/message
  - `likes`
  - `time_stamp` or `createdAt`

This feature does not create, update, or delete data.

---

## Tech Constraints (Feature-Level)

- Must preserve existing protected routing.
- Must preserve existing `MainLayout`, `Header`, and `Sidebar`.
- Must not modify backend code.
- Must not create new endpoints.
- Must not change schemas.
- Must use existing service files where possible.
- Must follow existing CodeBloggs theme styling.
- Must not refactor Home or Blogs logic unnecessarily.
- Must keep this feature focused only on the Network page.

---

## Acceptance Criteria

- [ ] `/network` remains protected.
- [ ] Authenticated users can access `/network`.
- [ ] Network page displays users as cards.
- [ ] Each card displays user initials.
- [ ] Each card displays the user’s name.
- [ ] Each card displays available profile details.
- [ ] Each card displays the user’s latest post if one exists.
- [ ] Each card displays a fallback message if the user has no posts.
- [ ] Loading state appears while data is fetching.
- [ ] Empty state appears when no users exist.
- [ ] Error state appears when data cannot be fetched.
- [ ] Existing Home and Blogs pages still work.
- [ ] Existing layout, auth, and routing remain working.
- [ ] `npm run build` passes.
- [ ] `git diff --check` passes.
- [ ] An implementation log is created for this feature.

---

## Notes for the AI

- Read `ai/ai-spec.md` before implementing.
- Use this feature spec together with the global AI spec.
- Inspect the existing Home and Blogs implementations before coding.
- Reuse existing `userService.js` and `postService.js` patterns where possible.
- Do not implement admin functionality in this feature.
- Do not implement follow/messaging functionality.
- Do not modify backend routes or schemas.
- If backend response shapes differ from this spec, adapt the frontend to the actual backend and document the difference in the final report.