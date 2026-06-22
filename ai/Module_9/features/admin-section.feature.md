# 🤖 AI_FEATURE_Admin-Section

---

## Feature Identity

* **Feature Name:** Admin Section
* **Related Area:** Frontend

---

## Feature Goal

The Admin Section provides a protected admin-only page for future management tools. In Module 9, the Admin page should show two management cards, User Manager and Content Manager, but full admin CRUD functionality is not implemented yet.

Only users with `auth_level === "admin"` should be able to see the Admin navigation link or access the `/admin` page.

---

## Feature Scope

### In Scope (Included)

* Restrict `/admin` access to users with `auth_level === "admin"`.
* Hide the Admin sidebar/nav link from non-admin users.
* Replace the placeholder Admin page with two cards:

  * User Manager
  * Content Manager
* Clicking either card displays an “Under Construction” or “Coming in Module 10” alert/message.
* Optionally display lightweight read-only counts or summaries using existing endpoints.
* Preserve existing protected routing, layout, auth, session, Home, Blogs, Network, and Post Modal behavior.

### Out of Scope (Excluded)

* Creating admin-specific backend routes.
* Creating `/admin/*` API endpoints.
* Editing users.
* Deleting users.
* Updating user roles.
* Suspending users.
* Editing posts.
* Deleting posts.
* Moderating comments.
* Full User Manager CRUD.
* Full Content Manager CRUD.
* Backend schema changes.
* Backend controller changes.
* Module 10 admin functionality.

---

## Sub-Requirements (Feature Breakdown)

* **Requirement A — Admin Authorization**
  The `/admin` route must only be accessible to authenticated users whose `auth_level` is `"admin"`.

* **Requirement B — Non-Admin Redirect**
  If an authenticated non-admin user tries to access `/admin`, the app should redirect them to `/home` or show a clear not-authorized state.

* **Requirement C — Admin Nav Visibility**
  The Admin navigation link must only appear in the sidebar/nav for users whose `auth_level` is `"admin"`.

* **Requirement D — Admin Page Layout**
  The Admin page must display two main cards:

  * User Manager
  * Content Manager

* **Requirement E — User Manager Card**
  The User Manager card should communicate that user-management tools are planned but under construction for Module 10.

* **Requirement F — Content Manager Card**
  The Content Manager card should communicate that content-management tools are planned but under construction for Module 10.

* **Requirement G — Card Interaction Feedback**
  Clicking either management card must show a visible “Under Construction,” “Coming in Module 10,” or similar message.

* **Requirement H — Optional Summary Data**
  If implemented safely with existing endpoints, the Admin page may show read-only summary counts such as total users and total posts.

---

## User Flow / Logic (High Level)

1. User logs in.
2. App receives/validates the authenticated user through the existing session flow.
3. If the user has `auth_level === "admin"`:

   * Admin nav link appears.
   * User can navigate to `/admin`.
   * Admin page displays User Manager and Content Manager cards.
4. If the user does not have `auth_level === "admin"`:

   * Admin nav link is hidden.
   * Direct navigation to `/admin` redirects to `/home` or shows a not-authorized message.
5. Admin user clicks User Manager or Content Manager.
6. The app displays an “Under Construction” / “Coming in Module 10” message.
7. No backend data is modified.

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

* `client/src/pages/Admin.jsx`
* `client/src/components/Sidebar.jsx`
* `client/src/components/RequireAuth.jsx` or route-level authorization logic if appropriate
* `client/src/context/AuthContext.jsx`
* `client/src/services/userService.js` if summary data is used
* `client/src/services/postService.js` if summary data is used
* `client/src/styles/theme.css`
* Existing protected layout:

  * `MainLayout.jsx`
  * `Header.jsx`
  * `Sidebar.jsx`

### Backend / API

Use existing backend routes only.

Relevant existing endpoints may include:

* `GET /session/validate` — validates current session and returns current user with `auth_level`.
* `GET /user` — retrieves all users, if read-only summary data is used.
* `GET /posts` — retrieves all posts, if read-only summary data is used.

No admin-specific backend routes should be created for this feature.

---

## Data Used or Modified

This feature reads:

* **Authenticated User Data**

  * `_id`
  * `first_name`
  * `last_name`
  * `auth_level`

Optional read-only summary data:

* **User Data**

  * total number of users

* **Post Data**

  * total number of posts

This feature must not create, update, or delete database records.

---

## Tech Constraints (Feature-Level)

* Must preserve existing authentication/session flow.
* Must use `auth_level === "admin"` as the admin authorization check.
* Must not create or modify backend routes.
* Must not create or modify backend schemas.
* Must not implement Module 10 admin CRUD.
* Must hide the Admin navigation link for non-admin users.
* Must prevent non-admin users from accessing `/admin` directly.
* Must preserve existing layout, Header, Sidebar, Home, Blogs, Network, Post Modal, Login, Register, and Logout behavior.
* Must follow existing CodeBloggs styling and brand theme.
* Must keep implementation focused and minimal.

---

## Acceptance Criteria

* [ ] `/admin` remains protected behind authentication.
* [ ] `/admin` is restricted to users with `auth_level === "admin"`.
* [ ] Non-admin users cannot access `/admin` directly.
* [ ] Non-admin users do not see the Admin sidebar/nav link.
* [ ] Admin users can see the Admin sidebar/nav link.
* [ ] Admin users can access `/admin`.
* [ ] Admin page displays a User Manager card.
* [ ] Admin page displays a Content Manager card.
* [ ] Clicking User Manager shows an under-construction style message.
* [ ] Clicking Content Manager shows an under-construction style message.
* [ ] No user, post, or comment records are modified.
* [ ] Existing Home page still works.
* [ ] Existing Blogs page still works.
* [ ] Existing Network page still works.
* [ ] Existing Post Modal still works.
* [ ] Existing login/register/session/logout flow still works.
* [ ] `npm run build` passes.
* [ ] `git diff --check` passes.
* [ ] An implementation log is created for this feature.

---

## Notes for the AI

* Read `ai/ai-spec.md` before implementing.
* Use this feature spec together with the global AI spec.
* Inspect `AuthContext.jsx` before deciding how to access the current user.
* Inspect `Sidebar.jsx` before changing nav visibility.
* Inspect `Admin.jsx` before replacing the placeholder page.
* Do not create admin backend endpoints.
* Do not implement user or content CRUD.
* Do not modify backend schemas or controllers.
* Keep the Admin Section aligned with Module 9 scope: placeholder management cards only.
* If optional summary counts are added, they must be read-only and use existing endpoints.
* If there is no admin user available for testing, document that limitation in the implementation log and final report.
