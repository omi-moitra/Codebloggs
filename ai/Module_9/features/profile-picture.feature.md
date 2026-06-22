# 🤖 AI_FEATURE_Profile-Picture

---

## Feature Identity

* **Feature Name:** Profile Picture
* **Related Area:** Fullstack / Extra Feature

---

## Feature Goal

The Profile Picture feature allows logged-in users to upload a JPEG or PNG profile picture from an Account Settings page. The uploaded image is stored in a separate MongoDB `ProfilePic` collection and replaces initials avatars in the Header, Home page, and Blogs page when available.

This feature is an extra enhancement and is **not part of the required Module 9 rubric**.

---

## Feature Scope

### In Scope (Included)

* Add backend support for profile picture upload and retrieval.
* Store profile pictures in a separate `ProfilePic` MongoDB collection.
* Do not modify the existing `User` schema.
* Add an Account Settings page at `/settings`.
* Add a Settings nav link.
* Update Account Settings navigation from the Header/user menu.
* Allow users to upload JPEG or PNG images only.
* Limit uploaded files to 2 MB.
* Show a local image preview before upload.
* Show success/error feedback after upload.
* Display uploaded profile pictures in:

  * Header
  * Home
  * Blogs
  * Account Settings
* Fall back to initials avatars when no profile picture exists.
* Update README to clearly document this as an extra non-rubric feature.
* Update feature documentation and implementation log.

### Out of Scope (Excluded)

* Changing the `User` schema.
* Storing image files on disk.
* Uploading GIF, SVG, WEBP, or other formats.
* Cropping or editing images.
* Multiple profile pictures per user.
* Profile bio editing.
* Password/account credential editing.
* Admin profile picture management.
* Any Module 10 account settings functionality.

---

## Sub-Requirements (Feature Breakdown)

* **Requirement A — ProfilePic Schema**
  Create a `ProfilePic` schema with `user_id`, `data`, `mime_type`, and `uploaded_at`.

* **Requirement B — One Picture Per User**
  Each user should have only one profile picture document. Re-uploading should replace the existing document.

* **Requirement C — Upload Endpoint**
  Add `POST /profile-pic` with session protection and `multer.single("image")`.

* **Requirement D — Retrieval Endpoint**
  Add `GET /profile-pic/:userId` to return raw binary image data with the correct `Content-Type`.

* **Requirement E — Upload Restrictions**
  Only JPEG and PNG files are accepted, with a maximum file size of 2 MB.

* **Requirement F — API Upload Client**
  Add an upload request helper that sends `FormData` with `credentials: "include"` and does not manually set `Content-Type`.

* **Requirement G — Profile Picture Service**
  Add profile picture service methods for upload and URL generation.

* **Requirement H — Account Settings Page**
  Add `/settings` as a protected page inside the existing `MainLayout`.

* **Requirement I — Settings Navigation**
  Add Settings to the sidebar and route Account Settings menu behavior to `/settings`.

* **Requirement J — Avatar Replacement**
  Replace initials-only avatars with profile picture images when available, while keeping initials fallback.

* **Requirement K — README Documentation**
  Update README to document the Profile Picture feature as an extra enhancement outside the required rubric.

---

## User Flow / Logic (High Level)

1. User logs in.
2. User navigates to `/settings`.
3. Account Settings page displays the current profile picture if one exists.
4. If no picture exists, initials avatar is shown.
5. User selects a JPEG or PNG file.
6. Page displays a local preview.
7. User submits the upload.
8. Frontend sends `multipart/form-data` to `POST /profile-pic`.
9. Backend validates the session, file type, and file size.
10. Backend upserts the picture into the `ProfilePic` collection.
11. Frontend shows success feedback.
12. Header, Home, and Blogs show the uploaded profile picture where available.
13. If an image fails to load or does not exist, initials fallback remains visible.

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

* `client/src/pages/AccountSettings.jsx`
* `client/src/components/Header.jsx`
* `client/src/components/Sidebar.jsx`
* `client/src/layout/MainLayout.jsx`
* `client/src/pages/Home.jsx`
* `client/src/pages/Blogs.jsx`
* `client/src/services/apiClient.js`
* `client/src/services/profilePicService.js`
* `client/src/styles/theme.css`
* `client/src/main.jsx`
* `README.md`

### Backend / API

* `POST /profile-pic` — upload or replace current logged-in user’s profile picture.
* `GET /profile-pic/:userId` — retrieve a user’s profile picture as raw binary image data.

---

## Data Used or Modified

### New Collection: `ProfilePic`

* `user_id`

  * ObjectId reference to `User`
  * required
  * unique

* `data`

  * Buffer
  * required

* `mime_type`

  * String
  * required

* `uploaded_at`

  * Date
  * default: current date/time

### Upload Data

* Form field name: `image`
* Accepted MIME types:

  * `image/jpeg`
  * `image/png`
* Max file size:

  * 2 MB

---

## Tech Constraints (Feature-Level)

* Use `multer` for multipart upload handling.
* Use `memoryStorage()`.
* Do not write image files to disk.
* Do not modify the User schema.
* Use a separate `ProfilePic` schema/collection.
* Use `requireSession` on upload.
* `GET /profile-pic/:userId` may be public because it only returns profile picture image data.
* Use `FormData` on the frontend.
* Do not manually set `Content-Type` for multipart upload.
* Preserve existing auth/session behavior.
* Preserve existing Home, Blogs, Network, Admin, Post Modal, comments, likes, and replies.
* Clearly document this as an extra non-rubric feature.

---

## Acceptance Criteria

* [ ] `multer` is installed in the backend.
* [ ] `ProfilePic` schema exists.
* [ ] `POST /profile-pic` uploads or replaces the logged-in user’s profile picture.
* [ ] `GET /profile-pic/:userId` returns the image with correct `Content-Type`.
* [ ] JPEG uploads succeed.
* [ ] PNG uploads succeed.
* [ ] Non-image files are rejected.
* [ ] Files larger than 2 MB are rejected.
* [ ] `/settings` is protected.
* [ ] Logged-out users navigating to `/settings` are redirected to `/login`.
* [ ] Account Settings page shows current image or initials fallback.
* [ ] Account Settings page shows local preview before upload.
* [ ] Successful upload shows success feedback.
* [ ] Failed upload shows error feedback.
* [ ] Header shows uploaded profile picture when available.
* [ ] Home shows uploaded profile pictures when available.
* [ ] Blogs shows uploaded profile pictures when available.
* [ ] Initials fallback still works when no image exists.
* [ ] README documents this feature as an extra non-rubric enhancement.
* [ ] `npm run build` passes.
* [ ] `git diff --check` passes.
* [ ] Implementation log is created.

---

## Notes for the AI

* Read `ai/ai-spec.md` before implementing.
* This feature is an extra enhancement and must be labeled as **not part of the Module 9 rubric** in README and implementation notes.
* Follow the existing backend route/controller/schema patterns.
* Follow the existing frontend service/page/component patterns.
* Do not remove initials avatars; they are fallback UI.
* Do not modify unrelated features.
* Do not commit `.env` files or secrets.
* Keep the implementation focused on profile picture upload, retrieval, display, and documentation.
