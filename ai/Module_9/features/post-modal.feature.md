# 🤖 AI_FEATURE_Post-Modal

---

## Feature Identity

* **Feature Name:** Post Modal
* **Related Area:** Frontend

---

## Feature Goal

The Post Modal allows a logged-in user to create a new post from anywhere inside the protected application layout. When the user clicks the Header “Post” button, a modal should open over the current page with a clear modal title, a text area for the post message, and a submit button.

---

## Feature Scope

### In Scope (Included)

* Make the Header “Post” button open a modal.
* Modal must be available from all protected pages.
* Modal includes:

  * modal title/header
  * post text area
  * submit button
  * cancel/close behavior
* Clicking outside the modal closes it.
* Submitting the form creates a new post using the existing backend endpoint.
* Rely on the existing authenticated session for the post author.
* Show loading, success, and error states.
* Clear the form after successful submission.
* Preserve existing layout, auth, routing, Home, Blogs, and Network behavior.

### Out of Scope (Excluded)

* Adding a post title field to the database payload.
* Editing posts.
* Deleting posts.
* Creating comments.
* Editing or deleting comments.
* Admin functionality.
* Backend schema changes.
* Backend endpoint creation.
* Rebuilding Header or layout structure.

---

## Sub-Requirements (Feature Breakdown)

* **Requirement A — Global Modal Trigger**
  The Header “Post” button must open the Post Modal from any protected page.

* **Requirement B — Modal Layout**
  The modal must display a clear title/header, a text area, and a Post submit button.

* **Requirement C — Close Behavior**
  The modal must close when the user clicks outside it or uses a visible close/cancel control.

* **Requirement D — Form Validation**
  The user must not be able to submit an empty post.

* **Requirement E — Create Post Request**
  On submit, the frontend must send the post message to the existing backend post creation endpoint; the backend derives the author from the session.

* **Requirement F — Success Handling**
  After a successful post, the modal closes, the form clears, and the user receives visible feedback.

* **Requirement G — Error Handling**
  If the post fails, the modal remains open and shows a clear error message.

* **Requirement H — Page Refresh or Local Update**
  After creating a post, the current page should update if possible, or the user should receive feedback that the post was created successfully.

---

## User Flow / Logic (High Level)

1. Logged-in user is on any protected page.
2. User clicks the Header “Post” button.
3. Post Modal appears over the current page.
4. User types post content into the text area.
5. User clicks Post.
6. Frontend validates that the post is not empty.
7. Frontend sends a create-post request to the backend.
8. If successful:

   * modal closes
   * form clears
   * success message appears
   * current page updates if supported
9. If unsuccessful:

   * modal stays open
   * error message appears
10. User can close the modal by clicking outside it or using the close/cancel control.

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

* `client/src/components/Header.jsx`
* Possible new component: `client/src/components/PostModal.jsx`
* `client/src/context/AuthContext.jsx`
* `client/src/services/postService.js`
* `client/src/styles/theme.css`
* Existing protected layout pages:

  * `Home.jsx`
  * `Blogs.jsx`
  * `Network.jsx`
  * `Admin.jsx`

### Backend / API

Use existing backend routes only. Confirm actual paths and request requirements before coding.

Expected endpoint:

* `POST /posts` — create a new post

The frontend must use the existing backend post creation endpoint.

The request payload must match the backend schema and controller implementation. Field names must be verified before implementation and should not be assumed.

The frontend must not create new endpoints or modify existing backend routes.

---

## Data Used or Modified

This feature creates a new Post record.

Post data may include:

* post message/body/text field
* `likes`
* `time_stamp` or `createdAt`

This feature reads the current logged-in user from existing auth/session state.

---

## Tech Constraints (Feature-Level)

* Must preserve existing protected layout.
* Must preserve existing Header placement.
* Must use existing backend post endpoint.
* Must not create backend endpoints.
* Must not change backend schemas.
* Must not add a post title field unless the backend schema explicitly requires it.
* The modal title/header is UI text only, not a post database field.
* Must not send client-owned `user_id` or `time_stamp` fields when the backend derives them from the session/server clock.
* Must not break Home, Blogs, Network, Login, Register, or Logout.
* Must follow existing CodeBloggs visual theme.
* Must keep changes scoped to Post Modal behavior and required supporting files.

---

## Acceptance Criteria

* [ ] Header “Post” button opens the Post Modal from `/home`.
* [ ] Header “Post” button opens the Post Modal from `/blogs`.
* [ ] Header “Post” button opens the Post Modal from `/network`.
* [ ] Header “Post” button opens the Post Modal from `/admin` if the user has access.
* [ ] Modal shows a title/header, text area, and submit button.
* [ ] Empty posts cannot be submitted.
* [ ] Clicking outside the modal closes it.
* [ ] Close/cancel control closes the modal.
* [ ] Submitting a valid post calls the existing backend create-post endpoint.
* [ ] New post is connected to the logged-in user by the backend session.
* [ ] Success state appears after a post is created.
* [ ] Error state appears if post creation fails.
* [ ] Form clears after successful submission.
* [ ] Existing Home page still works.
* [ ] Existing Blogs page still works.
* [ ] Existing Network page still works.
* [ ] Existing auth/session flow still works.
* [ ] `npm run build` passes.
* [ ] `git diff --check` passes.
* [ ] An implementation log is created for this feature.

---

## Notes for the AI

* Read `ai/ai-spec.md` before implementing.
* Use this feature spec together with the global AI spec.
* Inspect the existing Header component before making changes.
* Inspect the backend Post schema and controller before implementing.
* Do not assume payload field names.
* Do not create backend routes.
* Do not modify backend schemas.
* The modal title/header is UI-only and is not stored in the database.
* Do not implement post editing or deleting.
* Do not implement comment creation.
* Do not refactor unrelated pages.
* Keep the implementation focused on opening the modal, creating posts, and handling success/error states.
* Reuse existing authentication and service patterns wherever possible.
* If the backend implementation differs from expectations, adapt the frontend to the actual backend contract and document the difference in the implementation log.
