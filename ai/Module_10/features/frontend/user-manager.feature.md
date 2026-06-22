# 🤖 AI_FEATURE_User-Manager

---

## Feature Identity

- **Feature Name:** User Manager
- **Related Area:** Frontend

---

## Feature Goal

Give administrators a protected admin section where they can view all registered users in a searchable, sortable, paginated table and delete users individually. This feature also establishes the Admin Page Shell — the route guard and tab navigation that both the User Manager and Content Manager panels live within.

---

## Feature Scope

### In Scope (Included)

- Admin Page Shell: `/admin` route restricted to admin role, with tab navigation to User Manager and Content Manager
- User Manager page at `/admin/users` — data table listing all users
- Pagination — default 10 users per page with previous/next controls
- Results-per-page dropdown — options: 10, 15, 20
- Search input — filters the user list by first and/or last name
- Alphabetical sort — sort table by first name or last name column header click
- Delete button per row with a confirmation modal
- Redux integration — fetch users, dispatch delete action, update store on success

### Out of Scope (Excluded)

- Editing or updating a user — covered by `user-update.feature.md`
- Content Manager panel — covered by `content-manager.feature.md`
- Skeleton loaders on the table — covered by `reactive-design.feature.md`
- All backend implementation (routes, controllers, models) — partner's responsibility
- Any new authentication or role assignment system

---

## Sub-Requirements (Feature Breakdown)

- **Admin Route Guard** — redirect any non-admin user away from `/admin` and all sub-routes; check role from Redux auth state
- **Admin Page Shell** — layout component containing the tab/link navigation between `/admin/users` (User Manager) and `/admin/content` (Content Manager)
- **User Table** — displays all users with columns: First Name, Last Name, Edit (link to `/admin/users/:id`), Delete
- **Pagination Controls** — previous/next page buttons; tracks current page in component state; defaults to page 1
- **Results-Per-Page Dropdown** — lets admin choose 10, 15, or 20 users per page; resets to page 1 on change
- **Search Input** — text field at the top of the table; filters displayed users by first name or last name on input change or submit
- **Alphabetical Sort** — clicking First Name or Last Name column header sorts the visible list A→Z / Z→A (client-side)
- **Delete Button** — per-row button that opens a confirmation modal before any destructive action
- **Delete Confirmation Modal** — shows the user's name and asks admin to confirm; cancelling closes without action
- **Redux Delete Action** — on confirmation, dispatches `DELETE /user/:id`; removes the user from the Redux store on success

---

## User Flow / Logic (High Level)

1. Admin navigates to `/admin` or `/admin/users`
2. Route guard reads the role from Redux auth state — non-admins are redirected to `/home` or `/login`
3. Admin Page Shell renders with tab navigation; User Manager tab is active
4. Component dispatches a Redux action that calls `GET /user` and stores the user list
5. Table renders with the first 10 users (default page size)
6. Admin types in the search field — list filters client-side by first/last name
7. Admin clicks a column header — list sorts alphabetically by that column (client-side)
8. Admin changes results per page — table re-renders with the new page size, resets to page 1
9. Admin uses previous/next controls to paginate through results
10. Admin clicks "Delete" on a row — confirmation modal opens showing the user's name
11. Admin confirms — Redux dispatches `DELETE /user/:id`; backend handles cascade deletion of their posts/comments
12. User is removed from the Redux store and disappears from the table without a page reload
13. Admin can click "Edit" on a row — navigates to `/admin/users/:id` (handled by `user-update.feature.md`)

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `/admin` — Admin Page Shell (renders tab navigation; defaults to or redirects to `/admin/users`)
- `/admin/users` — User Manager page (table, search, sort, pagination, delete)
- `AdminPage` component (or `AdminShell`) — shell with tab navigation between User Manager and Content Manager
- `UserManager` component — table, search bar, sort controls, pagination, results-per-page dropdown
- `ConfirmModal` component — reusable confirmation dialog (used here for delete; reused in Content Manager)

### Backend / API (implemented by partner — call these, do not implement them)

- `GET /user` — fetch all users (exists from Module 9); use the response to populate the table client-side
- `DELETE /user/:id` — delete a user (new M10 endpoint); the backend handles cascade deletion of their posts and comments

---

## UI Layout

### Screen 1 — Admin Page Shell (`/admin/users`, User Manager tab active)

```
+---------------------------------------------------------------------------------------------------------+
| [CodeBloggs]                                                               [Post] [Crescent] [Anakin V] |
+---------------------------------------------------------------------------------------------------------+
|          |                                                                                              |
|  Home    |  [User Manager]   Content Manager                                                           |
|          |  ─────────────────────────────────────────────────────────────────────────────────────────  |
|  Blogs   |                                                                                              |
|          |  Search: [ Search by first or last name...                              ]                   |
|  Network |                                                                                              |
|          |  +---------------------+---------------------+--------------+---------------------------+   |
| [Admin ] |  | First Name ^       | Last Name           | Edit         | Delete                    |   |
|          |  +---------------------+---------------------+--------------+---------------------------+   |
|          |  | Alice               | Adams               | [Edit]       | [Delete]                  |   |
|          |  | Bob                 | Baker               | [Edit]       | [Delete]                  |   |
|          |  | Carol               | Chen                | [Edit]       | [Delete]                  |   |
|          |  | David               | Diaz                | [Edit]       | [Delete]                  |   |
|          |  | Eve                 | Evans               | [Edit]       | [Delete]                  |   |
|          |  +---------------------+---------------------+--------------+---------------------------+   |
|          |                                                                                              |
|          |  [← Prev]   Page 1 of 3   Show: [10 ▼]   [Next →]                                         |
|          |                                                                                              |
+----------+----------------------------------------------------------------------------------------------+
```

- The active tab (`User Manager`) is visually distinguished from the inactive tab (`Content Manager`) via Bootstrap's default `<Nav variant="tabs">` active state.
- The tab underline acts as the section divider — no additional heading is needed below it.
- **Row hover:** When the cursor enters a table row, the entire row receives a light background highlight. This is handled by Bootstrap's `.table-hover` class via the `hover` prop on `<Table>` — no custom CSS required. The full row highlights, not individual cells.

### Screen 2 — Sort indicator (column header toggled)

First click on a column header → ascending (`^`). Second click → descending (`v`). Only one column is active at a time.

```
+---------------------+---------------------+--------------+---------------------------+
| First Name          | Last Name v         | Edit         | Delete                    |
+---------------------+---------------------+--------------+---------------------------+
| Eve                 | Evans               | [Edit]       | [Delete]                  |
| David               | Diaz                | [Edit]       | [Delete]                  |
| Carol               | Chen                | [Edit]       | [Delete]                  |
```

### Screen 3 — Empty search state

No pagination controls are rendered when the filtered list is empty.

```
|  Search: [ xyz                                                       ]               |
|                                                                                       |
|  +---------------------+---------------------+--------------+------------------+    |
|  | First Name ^       | Last Name           | Edit         | Delete           |    |
|  +---------------------+---------------------+--------------+------------------+    |
|  |                    No users match your search.                              |    |
|  +-----------------------------------------------------------------------------+    |
```

### Screen 4 — Delete Confirmation Modal (centered overlay)

```
                    +--------------------------------------------------+
                    |  Delete User                                   X |
                    +--------------------------------------------------+
                    |                                                  |
                    |  Are you sure you want to delete                 |
                    |  Alice Adams?                                    |
                    |                                                  |
                    |  This action cannot be undone.                   |
                    |                                                  |
                    +--------------------------------------------------+
                    |                       [Cancel]   [Delete]        |
                    +--------------------------------------------------+
```

- **Title:** `Delete User`
- **Body:** `Are you sure you want to delete [First Name Last Name]? This action cannot be undone.`
- **Cancel** dismisses the modal with no side effects; **Delete** triggers the Redux dispatch.

### Bootstrap Component Map

| UI Element | Bootstrap Component / Props |
|---|---|
| Tab navigation | `<Nav variant="tabs">` + `<Nav.Link as={Link} to="...">` per tab |
| Search field | `<Form.Control type="text" placeholder="Search by first or last name..." />` |
| Table | `<Table striped bordered hover responsive>` |
| Sort column headers | Clickable `<th style={{ cursor: 'pointer' }}>` — append `^` (ascending) or `v` (descending) to the active column label |
| Row hover highlight | `<Table hover>` — Bootstrap's `.table-hover` applies a full-row background highlight on `mouseenter`; no custom CSS required |
| Edit button | `<Button variant="outline-primary" size="sm">Edit</Button>` |
| Delete button | `<Button variant="outline-danger" size="sm">Delete</Button>` |
| Previous / Next | `<Button variant="outline-secondary" size="sm">` |
| Results-per-page | `<Form.Select size="sm">` with options 10, 15, 20 |
| Confirmation modal | `<Modal centered>` + `<Modal.Header closeButton>` + `<Modal.Body>` + `<Modal.Footer>` |
| Modal Cancel | `<Button variant="secondary">Cancel</Button>` |
| Modal Confirm delete | `<Button variant="danger">Delete</Button>` |

---

## Data Used or Modified

- **User object read:** `_id`, `first_name`, `last_name`, `email`, `role`, `profile_image`
- **Redux store state:** user list array, loading flag, current page number, page size, search query string
- **On delete:** dispatch the DELETE action and remove the user from the Redux store on a successful response; cascade logic is handled entirely by the backend

---

## Tech Constraints (Feature-Level)

- Use React Router `<Route>` and `<Navigate>` (or `<Redirect>`) for `/admin` and `/admin/users`
- Role check must read from the Redux auth state (populated at login) — do not make an extra API call to check role on every render
- Use Redux + Redux Thunk for all async API calls (fetch users, delete user)
- Use React Bootstrap for table, modal, and dropdown components — no new UI libraries
- If `GET /user` returns all users at once, implement pagination, search, and sort client-side (array slicing + string filtering + array sort)
- ESM6 syntax throughout (`import`/`export`) — no CommonJS
- Every generated file must open with a comments-based TOC per the ai-spec Code Quality Requirements

---

## Acceptance Criteria

- [ ] Non-admin users are redirected away from `/admin` and `/admin/users`
- [ ] Admin sees a table of all users at `/admin/users`
- [ ] Table defaults to 10 results per page
- [ ] Previous/next pagination controls work correctly
- [ ] Results-per-page dropdown updates the table (10 / 15 / 20 options)
- [ ] Typing in the search field filters the user list by first and/or last name
- [ ] Clicking a column header sorts the table alphabetically by that column
- [ ] Each row has a Delete button
- [ ] Clicking Delete opens a confirmation modal showing the user's name
- [ ] Cancelling the modal does not delete the user
- [ ] Confirming the modal dispatches the delete action and removes the user from the table
- [ ] "Edit" link per row navigates to `/admin/users/:id` (wired up, even if `user-update.feature.md` is not yet complete)
- [ ] Tab navigation between User Manager and Content Manager renders correctly
- [ ] All existing Module 9 functionality is unaffected
- [ ] All files include a comments-based TOC and inline why-comments per ai-spec

---

## Notes for the AI

- **This spec is frontend-only. Do not generate backend code (routes, controllers, models, middleware). The endpoints listed under Backend / API are implemented by a separate developer — call them from the frontend but do not implement them.**
- The Admin Page Shell (route + tab navigation) is generated as part of this feature because it is a prerequisite for the User Manager. The Content Manager feature (`content-manager.feature.md`) will reuse this shell — do not regenerate it there.
- Role check: read `state.auth.user.role === 'admin'` (or the equivalent path in the Redux store) — do not call the session validate endpoint just to check the role on every render.
- Client-side pagination is the safe default. Slice the full user array based on `currentPage` and `pageSize`.
- The delete action calls `DELETE /user/:id`. The frontend only needs to remove the user from the Redux store on a successful response. Do not write any cascade logic in React.
- `ConfirmModal` should be a reusable component (not hard-coded into `UserManager`), as it will also be needed in the Content Manager.
- Sorting is client-side only — sort the in-memory array before slicing for the current page.
- Search should reset the page back to 1 when the query changes.
- The "Edit" column link goes to `/admin/users/:id`. That route and its page are implemented in `user-update.feature.md` — this feature only needs to render the navigation link.
- See `Working/Module_10/Integration.md` for the backend contract each endpoint must fulfill and the graceful fallback for endpoints not yet delivered.
