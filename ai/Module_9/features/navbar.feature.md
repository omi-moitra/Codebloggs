# AI Feature Specification - Navbar

Use with `./ai/ai-spec.md`.

## Goal

Render the left navigation panel for authenticated CodeBloggs pages.

## Scope

Included:
- Show Home, Blogs, Network, and Admin links.
- Keep navigation visible under the Header and left of main content.
- Highlight the active route.
- Show Admin only when `user.auth_level === "admin"`.

Excluded:
- Public Login/Register navigation.
- Additional main nav links outside the Module 9 requirements.

## Interfaces

- Component: `client/src/components/Sidebar.jsx`
- Layout: `client/src/layout/MainLayout.jsx`
- Auth: `client/src/context/AuthContext.jsx`

## Acceptance Criteria

- [ ] Navbar appears on all authenticated main pages.
- [ ] Navbar is hidden on `/login` and `/register`.
- [ ] Links include Home, Blogs, Network, and Admin.
- [ ] Admin link is hidden from basic users.
- [ ] Current page is visually highlighted.

