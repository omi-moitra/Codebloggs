# 🤖 AI_FEATURE_Reactive-Design

---

## Feature Identity

- **Feature Name:** Reactive Design (Skeleton Loaders)
- **Related Area:** Frontend

---

## Feature Goal

Replace blank or unchanged table views with animated skeleton placeholder rows during async data operations in the User Manager and Content Manager panels. This gives admins a visual signal that data is loading — preventing the perception of a frozen or broken UI while waiting for API responses.

---

## Feature Scope

### In Scope (Included)

- `SkeletonRow` component — a single reusable table row of animated gray placeholder bars; accepts a `cols` prop to match any column count
- `SkeletonTable` component — renders N `SkeletonRow` components inside a `<tbody>`; accepts `rows` (number of skeleton rows to show) and `cols` (number of columns) as props
- Skeleton CSS — `@keyframes` pulse animation; no third-party skeleton library
- User Manager skeleton states:
  - Initial load (`fetchUsers` in flight) — skeleton replaces the table body
  - Delete in flight (`deleteUser` in flight) — skeleton replaces the table body while the DELETE request processes
- Content Manager skeleton states:
  - Initial load (`fetchPosts` in flight) — skeleton replaces the table body
  - Delete in flight (`deletePost` in flight) — skeleton replaces the table body while the DELETE request processes
- Edit User Page skeleton state:
  - Fetch in flight (`fetchUserById` fallback call in flight on `EditUserPage`) — skeleton replaces the form fields while the user object loads

### Out of Scope (Excluded)

- Skeleton loaders on non-admin pages (home, blogs, network, profile) — this is the Extra Mile variant; do NOT implement during core feature work
- Skeleton loaders on the `EditUserPage` during the PATCH submit — the form stays visible with a disabled "Save Changes" button during the update call; no skeleton for form submissions
- Spinner or progress bar alternatives — skeleton rows are the required pattern
- Third-party libraries (react-loading-skeleton, etc.) — not permitted per ai-spec
- Any backend changes — skeleton loaders are driven entirely by existing Redux loading states

---

## Sub-Requirements (Feature Breakdown)

- **`SkeletonRow` component** — renders one `<tr>` with `cols` `<td>` cells; each cell contains a `<div className="skeleton-bar">` that receives the pulse animation; accepts `cols` as a required prop
- **`SkeletonTable` component** — renders a `<tbody>` with `rows` instances of `SkeletonRow`; accepts `rows` and `cols` as props; `rows` defaults to the current `pageSize` so the skeleton occupies the same vertical space as a full page of data
- **`SkeletonField` component** — renders a single `<div className="skeleton-bar skeleton-bar--field" />`; used in `EditUserPage` to replace each `<Form.Control>` while the fallback `GET /user/:id` is in flight; accepts no props
- **Skeleton CSS** — defines `.skeleton-bar` (gray rounded rectangle, full width of cell, ~1rem tall) and `@keyframes skeleton-pulse` (opacity cycles between 0.4 and 1.0); no external file required if co-located in a `Skeleton.css` imported by the component
- **User Manager integration** — in the `UserManager` component, replace the `<tbody>` with `<SkeletonTable rows={pageSize} cols={4} />` when `state.users.loading === true`; hide pagination controls during loading
- **Content Manager integration** — in the `ContentManager` component, replace the `<tbody>` with `<SkeletonTable rows={pageSize} cols={4} />` when `state.posts.loading === true`; hide pagination controls during loading
- **Edit User Page integration** — in `EditUserPage`, if the fallback `GET /user/:id` call is in flight, render skeleton bars in place of each form field instead of empty inputs; show the form normally once the data resolves
- **Redux loading state** — the existing Redux Thunks (`fetchUsers`, `deleteUser`, `fetchPosts`, `deletePost`) must dispatch a `SET_LOADING` (or equivalent) action before the fetch and clear it on resolve or reject; the `SkeletonTable` renders whenever `loading` is `true`

---

## User Flow / Logic (High Level)

**User Manager — initial load**

1. Admin navigates to `/admin/users`
2. `UserManager` mounts and dispatches `fetchUsers`
3. Redux sets `state.users.loading = true`
4. Table body immediately renders `<SkeletonTable rows={10} cols={4} />` — search inputs and column headers are visible; pagination controls are hidden
5. `GET /user` resolves → Redux sets `state.users.loading = false` and populates `state.users.users`
6. Skeleton is replaced by real data rows; pagination controls appear

**User Manager — delete in flight**

7. Admin confirms a delete — Redux dispatches `deleteUser(id)`
8. Redux sets `state.users.loading = true`
9. Table body switches back to skeleton while the DELETE request is in flight
10. DELETE resolves → loading clears; the deleted user is absent from the re-rendered table

**Content Manager — initial load and delete follow the same pattern as steps 1–10 above**, using `state.posts.loading` and `<SkeletonTable rows={pageSize} cols={4} />`

**Edit User Page — fallback fetch**

11. Admin navigates directly to `/admin/users/:id` without going through the User Manager
12. The user object is not in the Redux store — `EditUserPage` dispatches `fetchUserById(id)`
13. Redux sets a loading flag; form fields render as skeleton bars instead of empty inputs
14. `GET /user/:id` resolves → form fields populate with real data

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `SkeletonRow` component — `/client/src/components/SkeletonRow.jsx` (or co-located with `SkeletonTable`)
- `SkeletonTable` component — `/client/src/components/SkeletonTable.jsx`
- `SkeletonField` component — `/client/src/components/SkeletonField.jsx` (co-located with `SkeletonTable`); no props
- `Skeleton.css` — co-located in the same folder as the skeleton components; imported by both `SkeletonTable` and `SkeletonField`
- `UserManager` component — existing; conditionally renders `SkeletonTable` based on `state.users.loading`
- `ContentManager` component — existing; conditionally renders `SkeletonTable` based on `state.posts.loading`
- `EditUserPage` component — existing; conditionally renders skeleton bars on form fields based on a local `isFetching` flag

### Backend / API

No new backend endpoints. Skeleton loaders are driven entirely by existing Redux `loading` flags — no backend changes needed.

---

## UI Layout

### Screen 1 — User Manager skeleton (initial load or delete in flight)

The table headers and search controls remain visible. The `<tbody>` is replaced by animated skeleton rows. Pagination controls are hidden.

```
+---------------------------------------------------------------------------------------------------------+
| [CodeBloggs]                                                               [Post] [Crescent] [Anakin V] |
+---------------------------------------------------------------------------------------------------------+
|          |                                                                                              |
|  Home    |  [User Manager]   Content Manager                                                           |
|          |  ─────────────────────────────────────────────────────────────────────────────────────────  |
|  Blogs   |                                                                                              |
|          |  First Name: [ Search...           ]  Last Name: [ Search...           ]  [Clear]          |
|  Network |                                                                                              |
|          |  +---------------------+---------------------+--------------+---------------------------+   |
| [Admin ] |  | First Name         | Last Name           | Edit         | Delete                    |   |
|          |  +---------------------+---------------------+--------------+---------------------------+   |
|          |  |  ░░░░░░░░░░░░░░   |  ░░░░░░░░░░░░░░    |  ░░░░░░     |  ░░░░░░░░             |   |
|          |  |  ░░░░░░░░░░░░░░   |  ░░░░░░░░░░░░░░    |  ░░░░░░     |  ░░░░░░░░             |   |
|          |  |  ░░░░░░░░░░░░░░   |  ░░░░░░░░░░░░░░    |  ░░░░░░     |  ░░░░░░░░             |   |
|          |  |  ░░░░░░░░░░░░░░   |  ░░░░░░░░░░░░░░    |  ░░░░░░     |  ░░░░░░░░             |   |
|          |  |  ░░░░░░░░░░░░░░   |  ░░░░░░░░░░░░░░    |  ░░░░░░     |  ░░░░░░░░             |   |
|          |  +---------------------+---------------------+--------------+---------------------------+   |
|          |                                                                                              |
|          |  (pagination hidden while loading)                                                          |
|          |                                                                                              |
+----------+----------------------------------------------------------------------------------------------+
```

- `░` blocks represent `.skeleton-bar` divs with the pulse animation
- The number of skeleton rows matches the current `pageSize` (default 10)
- Column headers are always visible — they help the admin understand the structure before data arrives
- Search inputs are `disabled` while loading — accepting input against an empty array produces no visible results and creates confusing UX

### Screen 2 — Content Manager skeleton (initial load or delete in flight)

Same pattern as Screen 1 but with 4 columns (Author, Post, Date, Delete).

```
|          |  From: [ yyyy-mm-dd ]   To: [ yyyy-mm-dd ]   [Select All]                                  |
|          |                                                                                              |
|          |  +---------------------+------------------------------+------------------+--------------+   |
|          |  | Author             | Post                         | Date             | Delete       |   |
|          |  +---------------------+------------------------------+------------------+--------------+   |
|          |  |  ░░░░░░░░░░░░░░   |  ░░░░░░░░░░░░░░░░░░░░░░░░  |  ░░░░░░░░░░░░  |  ░░░░░░░   |   |
|          |  |  ░░░░░░░░░░░░░░   |  ░░░░░░░░░░░░░░░░░░░░░░░░  |  ░░░░░░░░░░░░  |  ░░░░░░░   |   |
|          |  |  ░░░░░░░░░░░░░░   |  ░░░░░░░░░░░░░░░░░░░░░░░░  |  ░░░░░░░░░░░░  |  ░░░░░░░   |   |
|          |  +---------------------+------------------------------+------------------+--------------+   |
|          |                                                                                              |
|          |  (pagination hidden while loading)                                                          |
```

### Screen 3 — Edit User Page skeleton (fallback fetch in flight)

Form labels are visible. Each input is replaced by a skeleton bar of the same width.

```
|  ← Return to User Manager                                                                   |
|                                                                                              |
|  Edit User                                                                                   |
|                                                                                              |
|  First Name                                                                                  |
|  [ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ]                             |
|                                                                                              |
|  Last Name                                                                                   |
|  [ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ]                             |
|                                                                                              |
|  Email                                                                                       |
|  [ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ]                             |
|                                                                                              |
|  (password fields hidden until data resolves)                                                |
|                                                                                              |
|                                                         [✓ Save Changes]  ← disabled       |
```

- Each form field skeleton is rendered by `<SkeletonField />` — a `<div className="skeleton-bar skeleton-bar--field" />` at `width: 100%` and `height: 2.25rem`; it sits where `<Form.Control>` would normally appear
- "Save Changes" stays `disabled` until the fetch resolves and the form populates; uses `<FaRegCheckSquare />` icon (import from `react-icons/fa`)
- `← Return to User Manager` link at the top of the page is always visible so the admin is never trapped

### Skeleton Animation (CSS reference)

```css
/* skeleton bar shape */
.skeleton-bar {
  background-color: #e0e0e0;
  border-radius: 4px;
  height: 1rem;
  width: 75%;
}

/* pulse: fades opacity back and forth */
@keyframes skeleton-pulse {
  0%   { opacity: 0.4; }
  50%  { opacity: 1.0; }
  100% { opacity: 0.4; }
}

.skeleton-bar {
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

/* modifier for form field skeletons — full-width, input height */
.skeleton-bar--field {
  width: 100%;
  height: 2.25rem;
}
```

---

## Data Used or Modified

- **Redux state read:** `state.users.loading`, `state.posts.loading` — these flags drive the conditional skeleton render; no new data fields are introduced
- **No data written** — skeleton loaders are purely presentational; they read Redux loading flags and render accordingly; no API calls or store mutations

---

## Tech Constraints (Feature-Level)

- Do NOT install react-loading-skeleton or any other third-party skeleton library — implement with plain CSS `@keyframes` per the ai-spec "Avoid unnecessary libraries" rule
- `SkeletonRow` and `SkeletonTable` must be generic components — they should not import or reference User Manager or Content Manager data; they accept only `rows` and `cols` as props
- The `rows` prop passed to `SkeletonTable` must always match the current `pageSize` so the skeleton occupies the same vertical space as a full data page — prevents layout shift when data loads
- Skeleton rows must appear inside the same `<Table>` element (inside `<tbody>`) — not as a separate component outside the table — so the column widths stay consistent with the headers
- Pagination controls (`[← Prev]`, `Show: [10 ▼]`, `[Next →]`) must be hidden when loading is true; show them again once data resolves
- The existing Redux Thunks (`fetchUsers`, `deleteUser`, `fetchPosts`, `deletePost`) must dispatch a loading action before the fetch begins and clear it on success or failure — if a Thunk does not already do this, add the dispatch; do not add loading state management in components directly
- Search and filter inputs (User Manager search field, Content Manager date filters) must render with `disabled={loading}` — inputs must not accept interaction while the table body is in skeleton state
- ESM6 syntax throughout — no CommonJS
- Every generated file must open with a comments-based TOC per the ai-spec Code Quality Requirements

---

## Acceptance Criteria

- [ ] Navigating to `/admin/users` shows skeleton rows in the table body while `fetchUsers` is in flight
- [ ] Once `fetchUsers` resolves, skeleton is replaced by real user data rows
- [ ] Confirming a delete on the User Manager shows skeleton rows while `deleteUser` is in flight
- [ ] Once `deleteUser` resolves, skeleton is replaced by the updated user list (deleted user absent)
- [ ] Navigating to `/admin/content` shows skeleton rows in the table body while `fetchPosts` is in flight
- [ ] Once `fetchPosts` resolves, skeleton is replaced by real post data rows
- [ ] Confirming a delete on the Content Manager shows skeleton rows while `deletePost` is in flight
- [ ] Navigating directly to `/admin/users/:id` (no prior User Manager visit) shows skeleton bars on form fields while `fetchUserById` is in flight; form populates once resolved
- [ ] Number of skeleton rows matches the current `pageSize` in both admin panels
- [ ] Column headers remain visible during all skeleton states
- [ ] Pagination controls are hidden during all skeleton states; they reappear once data loads
- [ ] Skeleton bars have a visible pulse animation
- [ ] `SkeletonTable` is reused in both User Manager and Content Manager — it is not duplicated
- [ ] No third-party skeleton library is introduced
- [ ] All existing Module 9 functionality is unaffected
- [ ] All files include a comments-based TOC and inline why-comments per ai-spec

---

## Notes for the AI

- **This spec is frontend-only. Do not generate backend code.**
- `SkeletonTable` is the single reusable component. Place it in a shared location (e.g., `client/src/components/`) so both `UserManager` and `ContentManager` can import it without duplication.
- The `rows` prop should be driven by the current `pageSize` state variable in the parent component — so a 20-results-per-page view shows 20 skeleton rows, not a hardcoded 10.
- The conditional render pattern inside a component looks like this:
  ```jsx
  <tbody>
    {loading
      ? Array.from({ length: pageSize }, (_, i) => <SkeletonRow key={i} cols={4} />)
      : currentPageItems.map(item => <DataRow key={item._id} item={item} />)
    }
  </tbody>
  ```
  Or equivalently, wrap the `Array.from` inside `SkeletonTable` and pass `rows` and `cols` as props.
- The existing Redux Thunks should already dispatch a loading flag before the fetch. Check the existing M9 reducer — if `state.users.loading` and `state.posts.loading` already exist, hook into them. If they do not, add `SET_USERS_LOADING` and `SET_POSTS_LOADING` actions to the respective slices.
- For the delete skeleton: `deleteUser` and `deletePost` should set `loading = true` before the DELETE fetch and `loading = false` after. This ensures the table shows skeletons briefly during the delete, then re-renders with the user/post removed.
- The Edit User Page skeleton (Screen 3) only triggers when the user navigates directly to `/admin/users/:id` and the Redux store does not already have the user (fallback `GET /user/:id` call). If the user came from the User Manager table, the user object is in the store and no fetch is needed — no skeleton appears on the form.
- Skeleton CSS can live in `Skeleton.css` co-located with `SkeletonTable.jsx`. Import it directly in `SkeletonTable.jsx`. Do not add skeleton styles to global stylesheets.
- The Extra Mile variant (skeleton loaders across the whole app — home, blogs, network) is out of scope for this feature. Only the admin section is in scope.
