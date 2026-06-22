# AI Feature Specification - Session Frontend

Use with `./ai/ai-spec.md`.

## Goal

Keep authenticated frontend routes synchronized with the backend cookie-based session.

## Scope

Included:
- Validate the current session with `GET /session/validate`.
- Store/read the `session_token` cookie with `react-use-cookie` when available to the client.
- Redirect unauthenticated users to `/login`.
- Hide Login/Register from authenticated users by redirecting to `/home`.
- Logout with `DELETE /session`, clear the cookie, and navigate to `/login`.

Excluded:
- JWT bearer auth.
- `localStorage` auth.
- Password reset.

## Interfaces

- Context: `client/src/context/AuthContext.jsx`
- Guard: `client/src/components/RequireAuth.jsx`
- Service: `client/src/services/authService.js`
- Endpoints: `POST /session`, `GET /session/validate`, `DELETE /session`

## Acceptance Criteria

- [ ] Protected routes validate the session before rendering.
- [ ] Missing or invalid sessions redirect to `/login`.
- [ ] Valid sessions render protected pages.
- [ ] Login is shown only when no valid session exists.
- [ ] Logout clears session state and returns to `/login`.

