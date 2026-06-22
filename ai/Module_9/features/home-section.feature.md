# 🤖 AI_FEATURE_Home-Section

---

## Feature Identity

* **Feature Name:** Home Section
* **Related Area:** Frontend

---

## Feature Goal

The Home Section gives the logged-in user a personalized landing page after authentication. It should display the user’s profile summary, total number of posts created by that user, the date of their most recent post, and a list of their posts with dates, likes, and related comments.

This feature makes the app feel like a real social blogging platform instead of sending the user to an empty page after login.

---

## Feature Scope

### In Scope (Included)

* Display logged-in user profile information on the Home page.
* Display a stylized avatar using the logged-in user’s initials.
* Display the logged-in user’s total post count.
* Display the date of the logged-in user’s most recent post.
* Fetch and display posts created by the logged-in user.
* Display each post’s message/body content.
* Display each post’s creation date.
* Display each post’s like count.
* Allow the user to click a thumbs-up icon to like/unlike a post if supported by the backend.
* Display comments associated with each post.
* Allow the user to create a comment on a post when the backend supports `POST /comments`.
* Include loading, empty, and error states.
* Preserve the existing protected route and main layout structure.

### Out of Scope (Excluded)

* Creating the global Post Modal from the header.
* Creating new posts unless the existing backend endpoint and current UI flow already support it cleanly.
* Editing or deleting posts.
* Editing or deleting comments.
* Admin-only functionality.
* Network page user cards.
* Blogs page global post feed.
* Backend schema changes.
* Backend route/controller creation.
* Refactoring unrelated layout, routing, session, or authentication code.

---

## Sub-Requirements (Feature Breakdown)

* **Requirement A — Logged-In User Data**
  The Home page must identify the currently logged-in user from the existing session/auth state.

* **Requirement B — User Avatar Initials**
  The Home page must display a stylized initials avatar using the logged-in user’s first and last name.

* **Requirement C — Profile Summary**
  The Home page must show basic user information such as name, occupation, location, or other fields available from the User data.

* **Requirement D — Total Post Count**
  The Home page must calculate and display the number of posts created by the logged-in user.

* **Requirement E — Date of Last Post**
  The Home page must determine and display the date of the logged-in user’s most recent post.

* **Requirement F — User Post List**
  The Home page must display the logged-in user’s posts, preferably with the newest post first.

* **Requirement G — Post Content and Date**
  Each post card must show the post message/body and its created date.

* **Requirement H — Post Likes**
  Each post must show a thumbs-up icon or like button and the current like count. If like/unlike behavior is implemented, it must update the UI after a successful backend response.

* **Requirement I — Post Comments List**
  Each post must show its associated comments using data from the Comment collection or the backend response.

* **Requirement J — Add Comment**
  Each post must provide a comment form that sends `post_id` and comment content to the existing comment creation endpoint.

* **Requirement K — Loading, Error, and Empty States**
  The Home page must clearly handle loading, failed fetches, and users with no posts.

---

## User Flow / Logic (High Level)

1. User logs in successfully.
2. User is redirected to `/home`.
3. The Home page loads inside the protected `MainLayout`.
4. The app checks the current authenticated user from the existing session/auth state.
5. The Home page fetches the data needed to render:

   * logged-in user details
   * posts
   * comments
6. The Home page filters or uses backend-filtered data to show only the logged-in user’s posts.
7. The page calculates:

   * total posts by the user
   * most recent post date
8. The page renders:

   * user profile card
   * initials avatar
   * total post count
   * last post date
   * list of user posts
   * likes and comments for each post
9. If the user clicks the like icon, the frontend sends the correct update request and updates the displayed like count after success.
10. If the user submits a comment, the frontend sends it to the backend and updates the visible comment list after success.
11. If no posts exist, the user sees a friendly empty state instead of a blank page.

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

* `client/src/pages/Home.jsx` — main page for this feature.
* `client/src/context/AuthContext.jsx` — used to access the logged-in user/session state if available.
* `client/src/services/` — may contain or receive a post/comment API service if one already exists or is needed.
* `client/src/styles/theme.css` or existing stylesheet — used for styling while preserving current theme.
* Existing `MainLayout`, `Header`, and `Sidebar` must remain intact.

### Backend / API

Use the existing backend routes only. Confirm actual paths before coding.

Expected related endpoints may include:

* `GET /user/:id` — retrieve logged-in user details.
* `GET /posts` — retrieve posts.
* `GET /comments` — retrieve comments.
* `POST /comments` — create a comment.
* `PATCH /posts/:id` — update post likes.

If the backend uses different route names or response shapes, the frontend must adapt to the actual implemented backend without changing backend code.

---

## Data Used or Modified

This feature may use:

* **User data**

  * `_id`
  * `first_name`
  * `last_name`
  * `email`
  * `location`
  * `occupation`
  * `auth_level`
  * `status`

* **Post data**

  * `_id`
  * `user_id` or related user reference
  * `body`, `message`, or equivalent post text field
  * `likes`
  * `createdAt` or post date field
  * comments list if embedded or linked

* **Comment data**

  * `_id`
  * `post_id`
  * `user_id`
  * comment text/body
  * `createdAt` or comment date field

This feature reads User, Post, and Comment data. It may update Post likes and create comments if the backend supports those routes.

---

## Tech Constraints (Feature-Level)

* Must use the existing React app structure.
* Must preserve protected routing.
* Must not move Login or Register into the main layout.
* Must not modify backend schemas.
* Must not create new backend endpoints.
* Must use existing backend response format where available.
* Must follow the CodeBloggs brand palette and existing layout styling.
* Must not add a post title field unless the backend schema explicitly requires it.
* Must avoid unrelated refactors.
* Must keep Home page work separate from Blogs, Network, Admin, and Post Modal features.
* Must run build validation after implementation.

---

## Acceptance Criteria

* [ ] `/home` remains protected and redirects unauthenticated users to `/login`.
* [ ] Authenticated users can access `/home`.
* [ ] Home page displays the logged-in user’s name or available profile information.
* [ ] Home page displays a stylized initials avatar.
* [ ] Home page displays the logged-in user’s total post count.
* [ ] Home page displays the date of the logged-in user’s latest post.
* [ ] Home page displays the logged-in user’s posts.
* [ ] Each post displays its content/message.
* [ ] Each post displays its date.
* [ ] Each post displays a like count.
* [ ] Like button/icon updates the count if supported by the backend.
* [ ] Each post displays its associated comments.
* [ ] Each post allows a logged-in user to add a comment through `POST /comments`.
* [ ] Loading state appears while data is being fetched.
* [ ] Empty state appears when the user has no posts.
* [ ] Error state appears if data cannot be fetched.
* [ ] Existing layout, header, sidebar, routing, and session logic continue working.
* [ ] `npm run build` passes.
* [ ] `git diff --check` passes.
* [ ] An implementation log is created for this feature.

---

## Notes for the AI

* Read `ai/ai-spec.md` before implementing this feature.
* Use this feature spec together with the global AI spec.
* First inspect the backend routes, controllers, and schemas before writing frontend fetch logic.
* Do not guess endpoint paths if the backend already defines them.
* Do not create duplicate auth/session logic.
* Do not refactor the whole app.
* Keep changes focused on the Home page and any small supporting service/component files required by this feature.
* Explain any backend/frontend contract mismatch in the final report.
* If the backend does not yet support likes or comments correctly, implement the display portions that are supported and clearly document the missing dependency.
