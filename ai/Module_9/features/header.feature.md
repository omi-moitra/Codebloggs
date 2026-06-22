# AI Feature Specification - Header

Use with `./ai/ai-spec.md`.

## Goal

Render the authenticated Header on main app pages with global post creation and account actions.

## Scope

Included:
- Show CodeBloggs brand/logo.
- Brand click navigates to `/home`.
- Show a Post button that opens the global Post Modal.
- Show a username dropdown.
- Dropdown contains Account Settings and Logout.
- Logout clears the session and navigates to `/login`.
- Account Settings gives visible feedback or navigates to the settings screen.

Excluded:
- Full account management.
- Header on Login/Register.

## Interfaces

- Component: `client/src/components/Header.jsx`
- Layout: `client/src/layout/MainLayout.jsx`
- Modal: `client/src/components/PostModal.jsx`
- Auth: `client/src/context/AuthContext.jsx`

## Acceptance Criteria

- [ ] Header appears on `/home`, `/blogs`, `/network`, and admin-only `/admin`.
- [ ] Header is hidden on `/login` and `/register`.
- [ ] Logo navigates home.
- [ ] Post button opens the modal above current content.
- [ ] User menu collapses/expands.
- [ ] Logout returns to `/login`.

