# Feature Protected Routes Implementation Log

## Files Created

- `client/src/components/RequireAuth.jsx`
- `client/.env.example`
- `Working/Module_9/implementation_logs/feature protected-routes implementation log.md`

## Files Modified

- `client/src/main.jsx`
- `client/.gitignore`
- `client/vite.config.js`
- `client/cypress.config.js`
- `Working/Module_9/implementation_logs/feature protected-routes implementation log.md`

## What Was Built

- Added a `RequireAuth` route guard for protected CodeBloggs pages.
- Checked for the `session_token` cookie using `react-use-cookie`.
- Redirected users without a `session_token` cookie to `/login`.
- Allowed users with a `session_token` cookie to render protected routes.
- Wrapped `/home`, `/blogs`, `/network`, and `/admin` with the route guard.
- Preserved the existing main layout for protected routes:
  - Header at the top
  - Sidebar on the left
  - Main content on the right
- Kept `/login` and `/register` public and outside the main layout.
- Added a frontend environment example for Module 9:
  - `VITE_API_BASE_URL=http://localhost:5050`
  - `VITE_CLIENT_ORIGIN=http://localhost:3000`
  - `VITE_DEV_SERVER_PORT=3000`
- Updated Vite to serve the client on port `3000` by default.
- Updated the Vite `/record` proxy to use `VITE_API_BASE_URL`, defaulting to `http://localhost:5050`.
- Updated Cypress `baseUrl` to `http://localhost:3000`.
- Ignored real frontend env files while keeping `client/.env.example` tracked.

## Key Decisions

- Used `RequireAuth.jsx` as a focused route guard component so route protection stays separate from layout rendering.
- Used cookie existence as temporary validation because full backend session validation belongs to a later session feature.
- Nested `MainLayout` inside `RequireAuth` so protected routes share the authenticated app shell only after the session cookie check passes.
- Left `/admin` protected only by session cookie existence for now because admin role checks are explicitly out of scope for this task.
- Kept API calls using the existing `/record` relative path so local development can route through the Vite proxy instead of hard-coding backend URLs in components.
- Added only non-secret frontend environment example values; no real secrets were added.

## Intentionally Not Implemented Yet

- Login form logic
- Registration form logic
- Logout behavior
- API session validation
- Redux auth state or auth actions
- Admin role restriction
- Backend validation
- Post modal behavior

## Verification Results

- 2026-06-16 follow-up:
  - Confirmed this is a combined repo with `client/` and `server/` directories.
  - Confirmed current branch is `feature/protected-routes`.
  - Confirmed no frontend env example existed before this update.
  - `npm install` was not needed because `client/node_modules` already exists.
  - `npm run build` passed.
  - `npm run dev -- --host 127.0.0.1` started Vite at `http://127.0.0.1:3000/`.
  - `curl -I http://127.0.0.1:3000/login` returned `HTTP/1.1 200 OK`.
  - Scoped lint passed for the changed feature/environment files:
    - `vite.config.js`
    - `cypress.config.js`
    - `src/main.jsx`
    - `src/components/RequireAuth.jsx`
  - Repo-wide `npm run lint` still fails because of existing unrelated lint issues in Cypress spec/plugin files, `RecordList.jsx`, and `fakeFetch.js`.
  - In-app browser verification could not run because the `iab` browser surface was unavailable in this session.
- `npm run dev` started successfully on `http://127.0.0.1:5174/` because port `5173` was already in use.
- `npm run build` passed.
- Scoped lint passed for the changed files:
  - `src/components/RequireAuth.jsx`
  - `src/main.jsx`
- Repo-wide `npm run lint` still fails because of pre-existing unrelated lint issues in Cypress files, `RecordList.jsx`, and `fakeFetch.js`.
- Cypress verification could not run because the cached Cypress app failed its startup smoke test on this machine.
- Headless Chrome verification passed:
  - `/login` renders with no Header or Sidebar and no console errors.
  - `/register` renders with no Header or Sidebar and no console errors.
  - `/home` redirects to `/login` when no `session_token` cookie exists.
  - `/blogs` redirects to `/login` when no `session_token` cookie exists.
  - `/network` redirects to `/login` when no `session_token` cookie exists.
  - `/admin` redirects to `/login` when no `session_token` cookie exists.
  - With a temporary `session_token` cookie, `/home` renders inside the main layout.
  - With a temporary `session_token` cookie, `/blogs` renders inside the main layout.
  - With a temporary `session_token` cookie, `/network` renders inside the main layout.
  - With a temporary `session_token` cookie, `/admin` renders inside the main layout.
  - No console errors were reported during the passing headless Chrome route verification.
