# Feature Profile Picture Implementation Log

## Branch

feature/profile-picture

## Rubric Status

This feature is an extra/non-rubric enhancement. It is not required by the
Module 9 grading rubric.

## Summary

Implemented profile picture upload and display support for CodeBloggs using a
separate MongoDB `ProfilePic` collection. The existing `User` schema was not
modified.

## Files Changed

- `README.md`
- `client/src/components/Header.jsx`
- `client/src/components/ProfileAvatar.jsx`
- `client/src/components/Sidebar.jsx`
- `client/src/layout/MainLayout.jsx`
- `client/src/main.jsx`
- `client/src/pages/AccountSettings.jsx`
- `client/src/pages/Blogs.jsx`
- `client/src/pages/Home.jsx`
- `client/src/services/apiClient.js`
- `client/src/services/profilePicService.js`
- `client/src/styles/theme.css`
- `server/controllers/profilePic.controller.js`
- `server/routes/profilePic.routes.js`
- `server/schemas/ProfilePic.js`
- `server/server.js`
- `server/package.json`
- `server/package-lock.json`

## What Was Built

- Added `ProfilePic` storage with one profile picture per user.
- Added `POST /profile-pic` for authenticated JPEG/PNG uploads.
- Added `GET /profile-pic/:userId` for raw binary image retrieval.
- Configured Multer memory storage with a 2 MB limit and JPEG/PNG filtering.
- Added frontend `uploadRequest` support for `FormData`.
- Added `profilePicService` for uploads and image URL generation.
- Added protected `/settings` Account Settings page.
- Added Settings to the sidebar.
- Updated Header Account Settings behavior to navigate to `/settings`.
- Added shared profile avatar rendering with image-first display and initials fallback.
- Updated Header, Home, Blogs, and Account Settings to use uploaded profile pictures.
- Updated Network user cards to use the shared `ProfileAvatar` component instead
  of local initials-only avatar markup.
- Updated Blogs comment author metadata and Home/Blogs local reply metadata to
  use `ProfileAvatar` with the existing initials fallback behavior.
- Added an optional shared `fallbackInitials` prop for local reply data that only
  has saved initials available.

## Profile Picture Consistency Audit

### Locations Audited

- `client/src/pages/Home.jsx`
- `client/src/pages/Blogs.jsx`
- `client/src/pages/Network.jsx`
- `client/src/pages/Admin.jsx`
- `client/src/components/Header.jsx`
- `client/src/components/Sidebar.jsx`
- `client/src/components/ProfileAvatar.jsx`
- `client/src/layout/MainLayout.jsx`

### Locations Updated

- `client/src/pages/Network.jsx`
  - Replaced initials-only user card avatars with `ProfileAvatar`.
  - Preserved user card layout, latest post preview, status badge, and auth
    level badge.
  - Added profile-picture cache refresh support after uploads.
- `client/src/pages/Blogs.jsx`
  - Added `ProfileAvatar` to comment author rows.
  - Replaced local reply initials avatar markup with `ProfileAvatar`.
- `client/src/pages/Home.jsx`
  - Replaced local reply initials avatar markup with `ProfileAvatar`.
- `client/src/components/ProfileAvatar.jsx`
  - Kept image-first behavior with image error fallback.
  - Added optional `fallbackInitials` support for local reply records.
- `client/src/styles/theme.css`
  - Added sizing/layout support for Blogs comment avatars.

### Locations Already Compliant

- `client/src/components/Header.jsx`
  - Already used `ProfileAvatar` for the signed-in user.
- `client/src/pages/Home.jsx`
  - Home profile summary already used `ProfileAvatar`.
- `client/src/pages/Blogs.jsx`
  - Blog post author rows already used `ProfileAvatar`.
- `client/src/pages/AccountSettings.jsx`
  - Account Settings preview already used `ProfileAvatar` with upload preview
    and cache refresh.
- `client/src/components/ProfileAvatar.jsx`
  - Already handled uploaded images, missing images, and broken image URLs by
    falling back to initials.

### Remaining Locations Intentionally Unchanged

- `client/src/pages/Admin.jsx`
  - Current Module 9 Admin page renders tool cards only; it does not render user
    identity, user cards, or profile summaries.
- `client/src/components/Sidebar.jsx`
  - Sidebar renders navigation labels only; it does not render user identity.
- `client/src/layout/MainLayout.jsx`
  - MainLayout composes Header, Sidebar, MainContent, and PostModal; avatar
    rendering remains delegated to child components.
- `client/src/pages/Home.jsx`
  - Persisted comments on the personal Home feed currently display comment
    content and timestamps only, with no user identity block to attach an
    avatar to.

## Preserved Behavior

- Existing login, register, logout, and session validation behavior is unchanged.
- Existing protected routes remain protected.
- Home, Blogs, Network, Admin, Post Modal, comments, likes, and local replies
  remain in place.
- User records are not changed by this feature.

## Testing Notes

- Backend started successfully on port `5050`.
- Frontend started successfully at `http://127.0.0.1:3000/`.
- Created and logged in a local test user through the API.
- PNG upload returned `200 OK` with standard JSON success feedback.
- `GET /profile-pic/:userId` returned `Content-Type: image/png` after PNG upload.
- JPEG upload returned `200 OK` and replaced the existing profile picture.
- `GET /profile-pic/:userId` returned `Content-Type: image/jpeg` after JPEG upload.
- Missing profile picture returned `404` JSON.
- Unauthenticated upload returned `401` JSON.
- Non-image upload returned `400` JSON: only JPEG and PNG accepted.
- Over-2 MB upload returned `400` JSON: profile pictures must be 2 MB or smaller.
- Frontend browser verification could not run because the in-app Browser surface
  was unavailable in this session.
- Logged-out `/settings` redirect: covered by existing protected route wrapper;
  pending browser verification.
- `npm run build` passed in `client/`.
- `git diff --check` passed.
