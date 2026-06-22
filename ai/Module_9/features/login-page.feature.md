# AI Feature Specification - Login Page

Use with `./ai/ai-spec.md`.

## Goal

Provide a standalone Login page where a guest signs in with email and password.

## Scope

Included:
- Render `/login` outside the authenticated layout.
- Collect `email` and `password`.
- Submit credentials to `POST /session`.
- Rely on the server to set the `session_token` cookie.
- Redirect authenticated users to `/home`.
- Link to `/register`.
- Show clear errors when login fails.

Excluded:
- Password reset.
- OAuth.
- Local storage authentication.

## Interfaces

- Page: `client/src/pages/Login.jsx`
- Auth context: `client/src/context/AuthContext.jsx`
- Service: `client/src/services/authService.js`
- Endpoint: `POST /session`

## Data And Validation

Request body:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Email and password are required. Email is submitted lowercase/trimmed.

## Acceptance Criteria

- [ ] `/login` renders without Header or Sidebar.
- [ ] Form contains required email and password fields.
- [ ] Submit calls `POST /session`.
- [ ] Success redirects to `/home`.
- [ ] Failure shows a visible error.
- [ ] The registration link navigates to `/register`.

