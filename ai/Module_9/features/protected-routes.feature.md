# 🤖 AI Feature Specification — Protected and Public Routes

Feature File: `./ai/features/protected-routes.feature.md`

This feature specification must be used together with:

`./ai/ai-spec.md`

---

# Feature Name

Protected and Public Routes

---

# Feature Goal

Set up React Router so CodeBloggs clearly separates public pages from protected application pages.

Public pages are available without a session.

Protected pages require a valid `session_token` cookie before the user can view them.

---

# Scope

## Included

* Public route setup
* Protected route setup
* Route guard component
* Redirect unauthenticated users to `/login`
* Keep `/login` and `/register` outside the main app layout
* Keep `/home`, `/blogs`, `/network`, and `/admin` inside the main app layout

## Excluded

Do NOT implement:

* Login form submission
* Registration form submission
* Backend API integration beyond a placeholder validation structure
* Logout functionality
* Admin role authorization
* Redux auth actions
* Full session frontend feature

---

# Route Rules

## Public Routes

These routes do not require authentication:

```text
/login
/register
```

Public routes must NOT show:

* Header
* Sidebar/Navbar

---

## Protected Routes

These routes require a valid session:

```text
/home
/blogs
/network
/admin
```

Protected routes must show:

* Header
* Sidebar/Navbar
* Main content area

---

# Session Rule

Protected routes must check for:

```text
session_token
```

stored in a cookie.

Use:

```text
react-use-cookie
```

If no `session_token` exists, redirect to:

```text
/login
```

---

# Expected Components

Create or update:

```text
RequireAuth.jsx
ProtectedRoute.jsx
App.jsx
main.jsx
Layout.jsx
```

Use existing file names if already present.

---

# Expected Behavior

## If user has no session token

Navigating directly to:

```text
/home
/blogs
/network
/admin
```

must redirect to:

```text
/login
```

---

## If user has a session token

Navigating to:

```text
/home
/blogs
/network
/admin
```

must allow the page to render inside the protected layout.

---

# Placeholder Session Validation

For this feature, checking whether the cookie exists is acceptable.

Full backend validation belongs to the Session Frontend feature.

Add comments explaining that this is a temporary route guard until full session validation is implemented.

---

# Acceptance Criteria

This feature is complete when:

* `/login` renders publicly
* `/register` renders publicly
* `/login` does not show Header or Sidebar
* `/register` does not show Header or Sidebar
* `/home` requires a session token
* `/blogs` requires a session token
* `/network` requires a session token
* `/admin` requires a session token
* Missing token redirects to `/login`
* Existing token allows protected pages to render
* Protected pages render inside main layout
* No console errors
* No lint errors

---

# Verification Steps

1. Clear browser cookies.
2. Go directly to `/home`.
3. Confirm the app redirects to `/login`.
4. Go directly to `/blogs`.
5. Confirm the app redirects to `/login`.
6. Add a temporary `session_token` cookie for testing.
7. Go to `/home`.
8. Confirm Header, Sidebar, and Home page content render.
9. Repeat for `/blogs`, `/network`, and `/admin`.
10. Confirm `/login` and `/register` do not show Header or Sidebar.

# Definition of Done

This feature is considered complete only when all of the following are true:

## Routing

* [ ] Public routes exist:

  * `/login`
  * `/register`

* [ ] Protected routes exist:

  * `/home`
  * `/blogs`
  * `/network`
  * `/admin`

---

## Route Protection

* [ ] A route guard component exists.
* [ ] The route guard checks for a `session_token` cookie.
* [ ] Users without a `session_token` are redirected to `/login`.
* [ ] Users with a `session_token` can access protected routes.
* [ ] Direct URL navigation to protected routes is blocked when unauthenticated.

---

## Layout Behavior

* [ ] `/login` does not display the Header.

* [ ] `/login` does not display the Sidebar.

* [ ] `/register` does not display the Header.

* [ ] `/register` does not display the Sidebar.

* [ ] `/home` displays:

  * Header
  * Sidebar
  * Main Content Area

* [ ] `/blogs` displays:

  * Header
  * Sidebar
  * Main Content Area

* [ ] `/network` displays:

  * Header
  * Sidebar
  * Main Content Area

* [ ] `/admin` displays:

  * Header
  * Sidebar
  * Main Content Area

---

## Code Quality

* [ ] Code follows the Global AI Specification.
* [ ] Beginner-friendly inline comments are included.
* [ ] Route protection logic is clearly documented.
* [ ] Temporary cookie validation is identified as a placeholder for the future Session Frontend feature.
* [ ] No duplicate routing logic exists.

---

## Testing

* [ ] Application starts successfully using:

```bash
npm run dev
```

* [ ] No console errors occur during navigation.
* [ ] No lint errors occur.
* [ ] Route redirection behavior has been manually verified.
* [ ] Protected pages render correctly when a test `session_token` exists.

---

## Documentation

* [ ] Implementation log created:

```text
Working/Module_9/implementation_logs/feature protected-routes implementation log.md
```

* [ ] Implementation log includes:

  * Files created
  * Files modified
  * Decisions made
  * Verification results
  * Follow-up items

---

## Merge Readiness

* [ ] Feature requirements match the Module 9 rubric.
* [ ] Feature passes manual verification.
* [ ] Feature is ready to merge into `dev`.
