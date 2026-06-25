# 🤖 AI_FEATURE_User-Update

---

## Feature Identity

- **Feature Name:** User Update (Edit User Page)
- **Related Area:** Frontend

---

## Feature Goal

Give administrators a dedicated page at `/admin/users/:id` where they can edit an existing user's first name, last name, email, and password. The page pre-populates with the selected user's current data, validates password confirmation before submission, and shows a single confirmation modal before dispatching the update to the backend. On success the admin is returned to the User Manager table.

---

## Feature Scope

### In Scope (Included)

- `EditUserPage` component at `/admin/users/:id` — a full page rendered inside the Admin Page Shell
- Pre-population of all editable fields (first name, last name, email) from the Redux store user matched by URL id param
- Password field (optional) — leave blank to keep the current password unchanged
- Password-confirmation field — must match the password field if a new password is entered
- Client-side validation — prevent submission if passwords are provided but do not match; block empty first name, last name, or email
- "Return to User Manager" link — navigates back to `/admin/users`; satisfies the grading sheet return-link requirement
- "Save Changes" button — disabled when validation fails; on click opens the ConfirmModal
- Single `ConfirmModal` — shared component; appears after admin clicks "Save Changes"; no modal stacking
- Redux integration — `updateUser(id, payload)` Thunk that calls `PATCH /user/:id`; updates the user in the Redux store on success; navigates to `/admin/users` after success
- Graceful fallback — if the endpoint is not yet delivered, catch the error and display an inline alert; do NOT update the Redux store

### Out of Scope (Excluded)

- Backend implementation of `PATCH /user/:id` — partner's responsibility
- Editing role or profile image — out of scope for M10
- Cascade logic — handled entirely by the backend
- User Manager table, delete flow — covered by `user-manager.feature.md`
- Skeleton loaders — covered by `reactive-design.feature.md`

---

## Sub-Requirements (Feature Breakdown)

- **`/admin/users/:id` route** — new React Router route; renders `EditUserPage` inside the Admin Page Shell; protected by the same admin route guard
- **`EditUserPage` component** — reads `:id` from URL params via `useParams`; looks up the matching user from `state.users` in the Redux store; falls back to `GET /user/:id` only if the user is not found in the store
- **Pre-populated form fields** — on mount, First Name, Last Name, and Email inputs are seeded with the user's current values; password fields start empty
- **Password field** — optional; `type="password"` with placeholder "Leave blank to keep current"; if blank on submit, password is excluded from the PATCH payload
- **Password-confirmation field** — required only when a new password is entered; inline validation error shown if values do not match; "Save Changes" button remains disabled until they match (or both are blank)
- **Client-side field validation** — First Name, Last Name, and Email must not be empty; show `isInvalid` state with `INVALID` feedback on each failing field
- **"Return to User Manager" link** — renders above the form heading; navigates to `/admin/users` via `<Link>` or `useNavigate`; no action dispatched
- **"Save Changes" button** — `<FaRegCheckSquare />` icon; disabled when validation fails; on click opens the ConfirmModal
- **ConfirmModal** — shared `ConfirmModal` component (single modal, no stacking); shows the user's full name and asks for confirmation before dispatching `updateUser`
- **Redux `updateUser` Thunk** — sends `PATCH /user/:id` with the updated payload; on 200, replaces the user in the Redux store and calls `navigate('/admin/users')`; on error, dispatches an error state
- **Inline error alert** — if the Thunk catches an error, show a Bootstrap `<Alert variant="warning">` above the form: "Update unavailable — backend update in progress. Please try again later." Do not navigate away on error.

---

## User Flow / Logic (High Level)

1. Admin is on `/admin/users` viewing the User Manager table
2. Admin clicks the Edit (`<FaRegEdit />`) button on a user row — navigates to `/admin/users/:id`
3. `EditUserPage` mounts; reads `:id` from URL params; finds the matching user in the Redux store
4. Form fields pre-populate: First Name, Last Name, Email from the store; password fields are empty
5. Admin edits one or more fields
6a. If admin enters a new password, the Confirm Password field becomes active; if they do not match, "Save Changes" is disabled and an inline error is shown
6b. If admin leaves both password fields blank, no password change is included in the payload
7. Admin clicks "Return to User Manager" — navigates to `/admin/users`; no action dispatched; table is unchanged
8. Admin clicks "Save Changes" (enabled only when validation passes) — ConfirmModal opens over the page
9. Admin clicks "Cancel" in ConfirmModal — modal closes; admin stays on `/admin/users/:id`
10. Admin clicks "Save Changes" in ConfirmModal — Redux dispatches `updateUser(id, payload)`
11. On success — Redux store is updated; `navigate('/admin/users')` is called; the updated row appears in the table
12. On error — ConfirmModal closes; inline alert appears above the form; Redux store is unchanged; admin stays on `/admin/users/:id`

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `/admin/users` — User Manager table (unchanged; Edit button navigates to `/admin/users/:id`)
- `/admin/users/:id` — EditUserPage (new route; renders inside the Admin Page Shell)
- `EditUserPage` component — full page form; reads user by id from Redux store; dispatches `updateUser`
- `ConfirmModal` component — shared component (already defined in `user-manager.feature.md`); reused here with title `"Confirm Changes"` and `variant="primary"` confirm button

### Backend / API (implemented by partner — call these, do not implement them)

- `GET /user/:id` — retrieve a single user (exists from M9); used as a fallback if the user is not found in the Redux store
- `PATCH /user/:id` — update a user (new M10 endpoint); the frontend sends a partial body; the backend hashes the password if provided and returns the updated user object

---

## UI Layout

### Screen 1 — Edit User Page (`/admin/users/:id`, pre-populated)

```
+---------------------------------------------------------------------------------------------------------+
| [CodeBloggs]                                                               [Post] [Crescent] [Anakin V] |
+---------------------------------------------------------------------------------------------------------+
|          |                                                                                              |
|  Home    |  [User Manager]   Content Manager                                                           |
|          |  ─────────────────────────────────────────────────────────────────────────────────────────  |
|  Blogs   |                                                                                              |
|          |  ← Return to User Manager                                                                   |
|  Network |                                                                                              |
|          |  Edit User                                                                                   |
| [Admin ] |                                                                                              |
|          |  First Name                                                                                  |
|          |  [ Alice                                    ]                                               |
|          |                                                                                              |
|          |  Last Name                                                                                   |
|          |  [ Adams                                    ]                                               |
|          |                                                                                              |
|          |  Email                                                                                       |
|          |  [ alice@example.com                        ]                                               |
|          |                                                                                              |
|          |  New Password   (leave blank to keep current)                                               |
|          |  [                                          ]                                               |
|          |                                                                                              |
|          |  Confirm New Password                                                                        |
|          |  [                                          ]                                               |
|          |                                                                                              |
|          |                                        [✓ Save Changes]                                     |
|          |                                                                                              |
+----------+----------------------------------------------------------------------------------------------+
```

- **"Return to User Manager"** — `<Link to="/admin/users">` renders above the page heading; navigates back without dispatching any action
- **"Edit User"** — page heading (`<h4>` or `<h5>`); not inside a modal
- **"Save Changes"** — `variant="primary"`; `disabled` when validation fails; `<FaRegCheckSquare />` icon (import from `react-icons/fa`)
- Form is constrained to a readable column width (`col-md-6` or `col-lg-5`) — not full viewport width

### Screen 2 — Password validation error (Save Changes disabled)

```
|          |  New Password   (leave blank to keep current)                                               |
|          |  [ ••••••••                                 ]                                               |
|          |                                                                                              |
|          |  Confirm New Password                                                                        |
|          |  [ ••••••                                   ]                                               |
|          |  ⚠ Passwords do not match.                                                                  |
|          |                                                                                              |
|          |                                        [✓ Save Changes]  ← disabled                        |
```

- Inline error appears below the Confirm Password field via `<Form.Text className="text-danger">`
- "Save Changes" is `disabled` until passwords match or both are cleared

### Screen 3 — Required field validation (INVALID state)

```
|          |  First Name                                                                                  |
|          |  [                                          ]                                               |
|          |  INVALID                                                                                    |
|          |                                                                                              |
|          |  Last Name                                                                                   |
|          |  [ Adams                                    ]                                               |
|          |                                                                                              |
|          |  Email                                                                                       |
|          |  [                                          ]                                               |
|          |  INVALID                                                                                    |
```

- Red border (`isInvalid`) and `INVALID` feedback text appear on any required field left empty on blur or submit attempt
- "Save Changes" remains `disabled` until all required fields are non-empty

### Screen 4 — Confirm Changes Modal (single modal, overlays the page)

```
                    +----------------------------------------------------+
                    |  Confirm Changes                                 X |
                    +----------------------------------------------------+
                    |                                                    |
                    |  Are you sure you want to update                   |
                    |  Alice Adams?                                      |
                    |                                                    |
                    |  These changes will be saved immediately.          |
                    |                                                    |
                    +----------------------------------------------------+
                    |                   [Cancel]   [✓ Save Changes]     |
                    +----------------------------------------------------+
```

- **Title:** `Confirm Changes`
- **Body:** `Are you sure you want to update [First Name Last Name]? These changes will be saved immediately.`
- **Cancel** — closes the modal; admin stays on `/admin/users/:id`
- **Save Changes** — dispatches `updateUser`; on success closes modal and navigates to `/admin/users`
- Single modal over the page — no stacking issue

### Screen 5 — Backend error state (inline alert, admin stays on page)

```
|          |  ┌──────────────────────────────────────────────────────┐  |
|          |  │ ⚠ Update unavailable — backend update in progress.   │  |
|          |  │   Please try again later.                            │  |
|          |  └──────────────────────────────────────────────────────┘  |
|          |                                                             |
|          |  First Name                                                 |
|          |  [ Alice                                    ]              |
|          |  ...                                                        |
```

- Alert shown above the form when the PATCH call returns an error
- Admin stays on `/admin/users/:id`; form fields retain their edited values
- Redux store is NOT modified

### Bootstrap Component Map

| UI Element | Bootstrap Component / Props |
|---|---|
| Page container | `<Container>` + `<Row><Col md={6}>` to constrain form width |
| Return to User Manager | `<Link to="/admin/users">← Return to User Manager</Link>` |
| Page heading | `<h4>Edit User</h4>` |
| Form wrapper | `<Form>` |
| First Name field | `<Form.Group><Form.Label>First Name</Form.Label><Form.Control type="text" isInvalid={...} /></Form.Group>` |
| Last Name field | `<Form.Group><Form.Label>Last Name</Form.Label><Form.Control type="text" isInvalid={...} /></Form.Group>` |
| Email field | `<Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" isInvalid={...} /></Form.Group>` |
| New Password field | `<Form.Control type="password" placeholder="Leave blank to keep current" />` |
| Confirm Password field | `<Form.Control type="password" />` |
| Required field validation | `<Form.Control isInvalid />` + `<Form.Control.Feedback type="invalid">INVALID</Form.Control.Feedback>` |
| Inline password error | `<Form.Text className="text-danger">Passwords do not match.</Form.Text>` |
| Backend error alert | `<Alert variant="warning">Update unavailable — backend update in progress. Please try again later.</Alert>` |
| Save Changes button | `<Button variant="primary" disabled={!isValid}><FaRegCheckSquare /> Save Changes</Button>` — import from `react-icons/fa` |
| Confirm modal | `<ConfirmModal>` — shared component; `title="Confirm Changes"`, body with user full name, `confirmVariant="primary"`, `confirmLabel="Save Changes"` |
| Confirm modal Cancel | `<Button variant="secondary">Cancel</Button>` |
| Confirm modal Save | `<Button variant="primary"><FaRegCheckSquare /> Save Changes</Button>` — import from `react-icons/fa` |

---

## Data Used or Modified

- **User object read (pre-populate):** `_id`, `first_name`, `last_name`, `email` — sourced from `state.users` in the Redux store matched by `:id` from `useParams`; fall back to `GET /user/:id` only if the user is not found in the store
- **PATCH payload sent:** `{ first_name, last_name, email }` — always included; `{ password }` — included only if the admin entered a non-blank value in the New Password field
- **Redux store state written on success:** the user array entry matching `_id` is replaced with the updated user object returned by the backend; `navigate('/admin/users')` is called
- **Redux store on error:** unchanged

---

## Tech Constraints (Feature-Level)

- Use `useParams` to read `:id` from the URL — do not pass the user object via router state or props from a parent
- Look up the user from `state.users` in the Redux store by `_id`; call `GET /user/:id` only as a fallback if the user is not in the store
- `EditUserPage` is a controlled component — all form field values are held in local `useState`; no Redux state for the form fields themselves
- Password is NEVER included in the PATCH payload if both password fields are empty — omit the key entirely; do not send `password: ""`
- Password hashing is the backend's responsibility — never hash on the frontend
- Use React Bootstrap `<Form>` validation patterns — no third-party form library
- On PATCH success, call `navigate('/admin/users')` via `useNavigate` — do not use `<Navigate>` component or `window.location`
- `ConfirmModal` must be the same shared component used by the delete flow in `user-manager.feature.md` — pass `title`, `body`, `confirmLabel`, `confirmVariant`, `onConfirm`, `onCancel`, and `show` as props; do not create a second confirmation component
- The "Return to User Manager" label must match exactly — this is a grading sheet requirement (see `Working/Module_10/Issues.md` Issue #11)
- Redux Thunk (`updateUser`) must be the single integration point — components only dispatch the action and read store state; no direct fetch calls in components
- ESM6 syntax throughout — no CommonJS
- Every generated file must open with a comments-based TOC per the ai-spec Code Quality Requirements

---

## Acceptance Criteria

- [ ] `/admin/users/:id` renders the Edit User page inside the Admin Page Shell
- [ ] Navigating to `/admin/users/:id` as a non-admin redirects to `/home` or `/login`
- [ ] Page pre-populates First Name, Last Name, and Email with the selected user's current data
- [ ] New Password and Confirm Password fields start empty on every page load
- [ ] Leaving both password fields blank excludes password from the PATCH payload
- [ ] Entering mismatched passwords shows an inline error and disables "Save Changes"
- [ ] Entering matching passwords clears the inline error and re-enables "Save Changes"
- [ ] Empty First Name, Last Name, or Email shows `INVALID` feedback and disables "Save Changes"
- [ ] "Return to User Manager" navigates to `/admin/users` with no data changed
- [ ] Clicking "Save Changes" (valid form) opens the Confirm Changes modal
- [ ] Clicking "Cancel" in the modal closes it; admin remains on `/admin/users/:id`
- [ ] Clicking "Save Changes" in the modal dispatches `updateUser` and navigates to `/admin/users` on success
- [ ] The updated user is reflected in the User Manager table after navigation
- [ ] On backend error, an inline alert appears above the form; admin stays on `/admin/users/:id`; Redux store is unchanged
- [ ] All existing Module 9 functionality is unaffected
- [ ] All files include a comments-based TOC and inline why-comments per ai-spec

---

## Notes for the AI

- **This spec is frontend-only. Do not generate backend code (routes, controllers, models, middleware). `PATCH /user/:id` is implemented by a separate developer — call it from the Redux Thunk, do not implement it.**
- This feature uses a full page at `/admin/users/:id`, not a modal overlay. `EditUserPage` renders inside the Admin Page Shell the same way `UserManager` does.
- Use `useParams` to get the user id from the URL. Look the user up in the Redux store (`state.users.find(u => u._id === id)`). Only call `GET /user/:id` as a fallback if the user is not found in the store.
- There is ONE modal in this feature — the shared `ConfirmModal`. There is no modal stacking.
- The "Return to User Manager" label must be exact — the grading sheet checks for a return mechanism. See `Working/Module_10/Issues.md` Issue #11.
- Password is optional — if both password fields are blank, omit the `password` key from the payload entirely. Do not send `password: ""` to the backend.
- Client-side validation rule: if `newPassword !== ""` OR `confirmPassword !== ""`, then `newPassword === confirmPassword` must be true before the form is considered valid.
- On PATCH success, the backend returns the updated user object. Use it to update the Redux store (`state.users = state.users.map(u => u._id === updated._id ? updated : u)`), then call `navigate('/admin/users')`.
- `ConfirmModal` is a shared component already defined in `user-manager.feature.md`. Pass `confirmLabel="Save Changes"` and `confirmVariant="primary"` so the delete flow's `"Delete"` / `"danger"` props are not hardcoded into the shared component.
- See `Working/Module_10/Integration.md` — Feature: User Update Screen — for the full backend contract for `PATCH /user/:id` and the graceful fallback behavior when the endpoint is not yet delivered.
