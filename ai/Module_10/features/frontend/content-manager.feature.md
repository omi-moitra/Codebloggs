# 🤖 AI_FEATURE_Content-Manager

---

## Feature Identity

- **Feature Name:** Content Manager
- **Related Area:** Frontend

---

## Feature Goal

Give administrators a panel inside the Admin Page Shell where they can view all blog posts in a paginated table, filter posts by date range, and delete individual posts. The Content Manager is the second panel within the existing admin tab navigation — it reuses the Admin Page Shell and `ConfirmModal` component already established by the User Manager feature.

---

## Feature Scope

### In Scope (Included)

- Content Manager page at `/admin/content` — data table listing all posts
- Date range filter — two date inputs (From / To) that filter the displayed post list client-side
- "Select All" button — clears both date inputs and restores the full unfiltered post list; resets to page 1
- Pagination — default 10 posts per page with previous/next controls
- Results-per-page dropdown — options: 10, 15, 20
- Delete button per row with a confirmation modal (reuses the shared `ConfirmModal` component)
- Redux integration — fetch posts, dispatch delete action, update store on success

### Out of Scope (Excluded)

- Editing or updating a post — the slides explicitly state Delete is the only CRUD operation for Content Manager
- Creating posts — not an admin function; covered by the existing M9 post flow
- Searching posts by title or author — only date range filtering is specified
- Sorting — not specified for Content Manager in slides or project-breakdown
- Admin Page Shell and tab navigation — already generated in `user-manager.feature.md`; do NOT regenerate it here
- Skeleton loaders — covered by `reactive-design.feature.md`
- All backend implementation (routes, controllers, models) — partner's responsibility

---

## Sub-Requirements (Feature Breakdown)

- **Content Manager page** — React component at `/admin/content`; renders inside the existing Admin Page Shell with the Content Manager tab active
- **Redux `fetchPosts` action** — dispatches `GET /posts` on mount and stores the full post list in the Redux store; no server-side date filter (filter is client-side)
- **Redux `fetchUsers` action** — also dispatched on mount (skipped if `state.users.users` is already populated, e.g., when navigating from User Manager); provides the user list used to resolve author names client-side
- **Post table** — displays paginated posts with columns: Author, Post (title or content excerpt), Date, Delete; the Author column resolves names client-side via a `usersById` lookup (see below)
- **Date range inputs** — two `<Form.Control type="date" />` inputs labelled "From:" and "To:"; filter the post list client-side on every change; either field can be used independently
- **Client-side date filter logic** — keep posts where `time_stamp >= startDate AND time_stamp <= endDate`; if From is blank, no lower bound; if To is blank, no upper bound; both blank means show all
- **"Select All" button** — clears both date inputs to empty and restores the full unfiltered list; resets current page to 1
- **Empty filter state** — if no posts match the selected date range, show a "No posts match the selected date range." row in the table body; hide pagination controls
- **Pagination controls** — previous/next buttons; tracks current page in component state; defaults to page 1; resets to page 1 when the date filter or page size changes
- **Results-per-page dropdown** — options 10, 15, 20; resets to page 1 on change
- **Delete button** — per-row button that opens the shared `ConfirmModal` with the post title (or excerpt) displayed
- **Delete Confirmation Modal** — reuses the existing `ConfirmModal` component; shows "Are you sure you want to delete this post? This action cannot be undone."; Cancel closes without action; Delete triggers the Redux dispatch
- **Redux `deletePost` action** — on confirmation, dispatches `DELETE /posts/:id`; removes the post from the Redux store on a successful response; backend handles cascade deletion of all comments on that post

---

## User Flow / Logic (High Level)

1. Admin navigates to `/admin/content` via the Content Manager tab
2. Admin Page Shell renders with the Content Manager tab active
3. Component dispatches `fetchPosts` — `GET /posts` populates the Redux store with all posts
4. Table renders with the first 10 posts (default page size); date inputs are empty (no filter applied)
5. Admin enters a start date in "From:" — list auto-filters to posts on or after that date
6. Admin enters an end date in "To:" — list further filters to posts on or before that date
7. Admin clicks "Select All" — both date inputs clear; full post list is restored; page resets to 1
8. Admin changes results per page — table re-renders with the new page size, resets to page 1
9. Admin uses previous/next controls to paginate through the filtered results
10. Admin clicks "Delete" on a row — `ConfirmModal` opens showing the post identifier
11. Admin cancels — modal closes; no action taken; list is unchanged
12. Admin confirms — Redux dispatches `deletePost(id)`; backend cascade-deletes all comments on that post
13. Post is removed from the Redux store and disappears from the table without a page reload

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `/admin/content` — Content Manager page (table, date filter, pagination, delete)
- `ContentManager` component — table, date range controls, "Select All" button, pagination, results-per-page dropdown
- `ConfirmModal` component — shared reusable confirmation dialog (already implemented in `user-manager.feature.md`); reused here for post delete confirmation

### Backend / API (implemented by partner — call these, do not implement them)

- `GET /posts` — fetch all posts (exists from Module 9); use the response to populate the Redux store; all filtering is done client-side on the returned array
- `DELETE /posts/:id` — delete a post (new M10 endpoint); the backend handles cascade deletion of all comments on that post

---

## UI Layout

### Screen 1 — Content Manager tab active, no date filter applied

```
+---------------------------------------------------------------------------------------------------------+
| [CodeBloggs]                                                               [Post] [Crescent] [Anakin V] |
+---------------------------------------------------------------------------------------------------------+
|          |                                                                                              |
|  Home    |  User Manager   [Content Manager]                                                           |
|          |  ─────────────────────────────────────────────────────────────────────────────────────────  |
|  Blogs   |                                                                                              |
|          |  From: [ yyyy-mm-dd ]   To: [ yyyy-mm-dd ]   [Select All]                                  |
|  Network |                                                                                              |
|          |  +---------------------+------------------------------+------------------+--------------+   |
| [Admin ] |  | Author             | Post                         | Date             | Delete       |   |
|          |  +---------------------+------------------------------+------------------+--------------+   |
|          |  | Alice Adams         | My First Blog Post...        | 2025-06-01       | [🗑]        |   |
|          |  | Bob Baker           | Thoughts on React...         | 2025-06-03       | [🗑]        |   |
|          |  | Carol Chen          | Summer Adventures...         | 2025-06-05       | [🗑]        |   |
|          |  | David Diaz          | Learning Node.js...          | 2025-06-07       | [🗑]        |   |
|          |  | Eve Evans           | Weekend Hike Recap...        | 2025-06-09       | [🗑]        |   |
|          |  +---------------------+------------------------------+------------------+--------------+   |
|          |                                                                                              |
|          |  [← Prev]   Page 1 of 3   Show: [10 ▼]   [Next →]                                         |
|          |                                                                                              |
+----------+----------------------------------------------------------------------------------------------+
```

- The active tab (`Content Manager`) is visually distinguished from the inactive tab (`User Manager`) via Bootstrap's `<Nav variant="tabs">` active state — same shell already built in `user-manager.feature.md`
- The "Post" column shows the post title if available, or a truncated excerpt of the content (truncate at ~40 characters with `...`)
- Row hover: Bootstrap `.table-hover` applies a full-row highlight on `mouseenter`

### Screen 2 — Date filter applied (From and To both set)

```
|  From: [ 2025-06-03 ]   To: [ 2025-06-07 ]   [Select All]                                 |
|                                                                                              |
|  +---------------------+------------------------------+------------------+--------------+  |
|  | Author             | Post                         | Date             | Delete       |  |
|  +---------------------+------------------------------+------------------+--------------+  |
|  | Bob Baker           | Thoughts on React...         | 2025-06-03       | [🗑]        |  |
|  | Carol Chen          | Summer Adventures...         | 2025-06-05       | [🗑]        |  |
|  | David Diaz          | Learning Node.js...          | 2025-06-07       | [🗑]        |  |
|  +---------------------+------------------------------+------------------+--------------+  |
|                                                                                              |
|  [← Prev]   Page 1 of 1   Show: [10 ▼]   [Next →]                                          |
```

- Only From set → show all posts on or after that date; no upper bound
- Only To set → show all posts on or before that date; no lower bound

### Screen 3 — Empty date filter state

No pagination controls are rendered when the filtered list is empty.

```
|  From: [ 2025-01-01 ]   To: [ 2025-01-02 ]   [Select All]              |
|                                                                           |
|  +---------------------+------------------------------+------------------+--------------+  |
|  | Author             | Post                         | Date             | Delete       |  |
|  +---------------------+------------------------------+------------------+--------------+  |
|  |             No posts match the selected date range.                                  |  |
|  +-----------------------------------------------------------------------------------+  |
```

### Screen 4 — Delete Confirmation Modal (centered overlay)

```
                    +--------------------------------------------------+
                    |  Delete Post                                   X |
                    +--------------------------------------------------+
                    |                                                  |
                    |  Are you sure you want to delete this post?      |
                    |                                                  |
                    |  "Thoughts on React..."                          |
                    |                                                  |
                    |  This action cannot be undone.                   |
                    |                                                  |
                    +--------------------------------------------------+
                    |                       [Cancel]   [🗑 Delete]   |
                    +--------------------------------------------------+
```

- **Title:** `Delete Post`
- **Body:** `Are you sure you want to delete this post? "[post title or excerpt]" This action cannot be undone.`
- **Cancel** dismisses the modal with no side effects; **Delete** triggers the Redux dispatch

### Bootstrap Component Map

| UI Element | Bootstrap Component / Props |
|---|---|
| Tab navigation (Content Manager active) | `<Nav variant="tabs">` + `<Nav.Link as={Link} to="/admin/content">` — reuses shell from `user-manager.feature.md` |
| From date input | `<Form.Control type="date" />` with label "From:" |
| To date input | `<Form.Control type="date" />` with label "To:" |
| Select All button | `<Button variant="outline-secondary" size="sm">Select All</Button>` — clears both date inputs and restores full list |
| Table | `<Table striped bordered hover responsive>` |
| Row hover highlight | `<Table hover>` — Bootstrap's `.table-hover` applies full-row background on `mouseenter`; no custom CSS |
| Delete button | `<Button variant="outline-danger" size="sm"><IoTrashOutline /></Button>` — import from `react-icons/io5` |
| Previous / Next | `<Button variant="outline-secondary" size="sm">` |
| Results-per-page | `<Form.Select size="sm">` with options 10, 15, 20 |
| Confirmation modal | `<ConfirmModal>` — shared component; title `"Delete Post"` |
| Modal Cancel | `<Button variant="secondary">Cancel</Button>` |
| Modal Confirm delete | `<Button variant="danger">Delete</Button>` |

---

## Data Used or Modified

- **Post object read:** `_id`, `title` (or `content` for excerpt if title field is not present), `time_stamp`, `user_id` — `GET /posts` returns raw `user_id` ObjectId references; no author name fields are populated inline
- **User object read (for Author column):** `_id`, `first_name`, `last_name`, `email` — sourced from `state.users.users` in the Redux store; cross-referenced against `post.user_id` using an in-memory `usersById` lookup map (same pattern as `Blogs.jsx` and `Home.jsx`)
- **Redux store state:** post list array, loading flag, current page number, page size, start date filter string, end date filter string
- **On delete:** dispatch the DELETE action and remove the post from the Redux store on a successful response; cascade deletion of all comments is handled entirely by the backend

---

## Tech Constraints (Feature-Level)

- The Admin Page Shell (route guard, tab navigation) already exists from `user-manager.feature.md` — do not regenerate it
- `ConfirmModal` is a shared component already implemented in the User Manager — import and reuse it; do not create a second confirmation component
- Use Redux + Redux Thunk for all async API calls (`fetchPosts`, `deletePost`)
- Date filtering is client-side only — filter the in-memory post array; do not make additional API calls with date query parameters
- If `GET /posts` returns all posts at once, implement pagination client-side (array slicing based on `currentPage` and `pageSize`)
- **Author name resolution is client-side** — `GET /posts` returns raw `user_id` ObjectId strings; do not expect `first_name` or `last_name` on the post object. Fetch `GET /user` (via `fetchUsers`) on mount and build a `usersById` map (`userId → userObject`) using the same `getId` / `getDisplayName` helper pattern established in `Blogs.jsx` and `Home.jsx`; dispatch `fetchUsers` only if `state.users.users.length === 0` to avoid a redundant call when the store is already populated
- The "Select All" button label must be exactly `Select All` — the grading sheet uses this label for Content Manager (see `Working/Module_10/Issues.md` Issue #12); do NOT use "Clear"
- Use React Bootstrap for all UI components — no new UI libraries
- ESM6 syntax throughout — no CommonJS
- Every generated file must open with a comments-based TOC per the ai-spec Code Quality Requirements

---

## Acceptance Criteria

- [ ] Admin sees a table of all posts at `/admin/content`
- [ ] Table defaults to 10 results per page
- [ ] Previous/next pagination controls work correctly
- [ ] Results-per-page dropdown updates the table (10 / 15 / 20 options)
- [ ] "From:" date input filters the list to posts on or after the selected date
- [ ] "To:" date input filters the list to posts on or before the selected date
- [ ] Both date inputs active together filter by the full date range
- [ ] Entering only one date filters by that bound alone with no constraint on the other
- [ ] "Select All" button clears both date inputs and restores the full post list; page resets to 1
- [ ] When no posts match the date range, a "No posts match the selected date range." message is shown; pagination controls are hidden
- [ ] Each row has a Delete button
- [ ] Clicking Delete opens the `ConfirmModal` showing the post identifier
- [ ] Cancelling the modal does not delete the post
- [ ] Confirming the modal dispatches the delete action and removes the post from the table without a page reload
- [ ] Content Manager tab is active and visually distinct when at `/admin/content`; User Manager tab navigates correctly back to `/admin/users`
- [ ] All existing Module 9 functionality is unaffected
- [ ] All files include a comments-based TOC and inline why-comments per ai-spec

---

## Notes for the AI

- **This spec is frontend-only. Do not generate backend code (routes, controllers, models, middleware). The endpoints listed under Backend / API are implemented by a separate developer — call them from the frontend but do not implement them.**
- The Admin Page Shell (route guard at `/admin`, tab navigation between User Manager and Content Manager) was already generated in `user-manager.feature.md`. Do not regenerate it here — only add the `/admin/content` route and the `ContentManager` component.
- The "Select All" button label must be `Select All` — not "Clear". The grading sheet uses different labels for each panel. See `Working/Module_10/Issues.md` Issue #12.
- Date filtering is client-side. `GET /posts` returns all posts — filter the array in memory before slicing for the current page. Do not add query parameters to the fetch call.
- Date comparison: convert `post.time_stamp` and the filter values to `Date` objects before comparing. Use `>=` for the start date and `<=` for the end date. Set the end date's time to 23:59:59 (end of day) to include posts created on the To date.
- `GET /posts` returns raw `user_id` ObjectId strings — author names are NOT populated inline by the backend. Resolve author names client-side: dispatch `fetchUsers` on mount (skip if `state.users.users` is already populated), build a `usersById` map, and look up each post's author via `usersById[getId(post.user_id)]`. Use `getDisplayName(author)` for the display value, falling back to the raw `user_id` string if the user is not found. This is the same pattern used by `Blogs.jsx` and `Home.jsx`.
- `deletePost` calls `DELETE /posts/:id`. The frontend only removes the post from the Redux store on a successful response. Do not write any cascade (comment deletion) logic in React — the backend handles it entirely.
- Pagination, results-per-page change, and date filter change must all reset `currentPage` to 1.
- Client-side filter logic: `filteredPosts = allPosts.filter(post => (!startDate || post.time_stamp >= startDate) && (!endDate || post.time_stamp <= endDate + 'T23:59:59'))`. Slice after filtering for the current page.
- See `Working/Module_10/Integration.md` for the full backend contract for `DELETE /posts/:id` and the graceful fallback behavior when the endpoint is not yet delivered.
