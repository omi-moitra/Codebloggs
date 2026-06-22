# 🤖 AI_SPEC — Project Specification (Main)

---

## Project Identity

* **Project Name:** CodeBloggs

* **Short Description:**
  CodeBloggs is a MERN-stack social blogging platform that allows users to create posts, interact with content, manage profiles, and connect with other users. Module 10 extends the platform with administrative tools, reactive loading states, and responsive layouts for mobile and tablet devices.

* **Project Type:**
  MERN Stack Application

---

## Goal and Scope

### Goal

Extend the existing CodeBloggs application by implementing administrative management tools, reactive loading experiences, and responsive layouts while maintaining all functionality completed in previous modules.

### In Scope (Build Now)

#### Backend (BE)

* BE User Update Endpoint
* BE User Delete Endpoint
* BE User Cascade Delete Logic
* BE Post Delete Endpoint
* BE Post Cascade Delete Logic
* BE Comment Delete Endpoint

#### Frontend (FE)

* FE User Manager
* FE User Update Screen
* FE Content Manager
* FE Pagination
* FE Results Per Page Controls
* FE User Search
* FE Date Filtering
* FE Skeleton Loaders
* FE Responsive Navigation

#### Documentation

* README.md updates
* Research.md updates
* AI Specifications
* Feature Specifications
* Postman Collection updates
* CONCEPTS.md

### Out of Scope (Do NOT Build)

* New authentication systems
* New user roles
* New database collections
* Real-time messaging
* Chat systems
* Major UI redesigns
* Color palette changes
* Replacing existing libraries
* Redux architecture refactors
* Features not listed in Module 10 requirements

---

## Users and Use Cases

* **Basic User**

  * Register an account
  * Login and logout
  * Create posts
  * Comment on posts
  * Like posts
  * View the network page
  * Manage personal profile information

* **Administrator**

  * Access the Admin section
  * Search users
  * Update users
  * Delete users
  * Search content
  * Filter content by date
  * Delete posts
  * Moderate site content

---

## Feature Index (Links Only)

* `schema-usage.feature.md`
* `server-configuration.feature.md`
* `user-endpoint.feature.md`
* `post-endpoint.feature.md`
* `comment-endpoint.feature.md`
* `user-manager.feature.md`
* `user-update.feature.md`
* `content-manager.feature.md`
* `reactive-design.feature.md`
* `responsive-design.feature.md`

---

## Pages / Screens / Routes (Project Map)

### Frontend Pages

* `/login` — user authentication
* `/register` — account registration
* `/home` — user dashboard
* `/blogs` — blog feed
* `/network` — user networking page
* `/admin` — administrator landing page
* `/admin/users` — user manager
* `/admin/users/:id` — user update page
* `/admin/content` — content manager

### Backend Routes

#### User Routes

* `GET /user` — retrieve users
* `GET /user/:id` — retrieve a user
* `PATCH /user/:id` — update a user
* `DELETE /user/:id` — delete a user and related content

#### Session Routes

* `POST /session` — create a session
* `GET /session/validate` — validate a session
* `DELETE /session` — terminate a session

#### Post Routes

* `GET /posts` — retrieve posts
* `POST /posts` — create a post
* `PATCH /posts/:id` — update post interactions
* `DELETE /posts/:id` — delete a post and related comments

#### Comment Routes

* `GET /comments` — retrieve comments
* `DELETE /comments/:id` — delete a comment

---

## Data and Models (Simple)

### Database

MongoDB

### Main Collections

#### User

Stores account information, profile details, and authorization information.

#### Session

Stores active authenticated sessions.

#### Post

Stores user-created blog posts.

#### Comment

Stores comments associated with blog posts.

---

## Tech Stack and Tools

### Frontend

* React
* React Router
* React Bootstrap
* Redux
* Redux Thunk
* CSS

### Backend

* Node.js
* Express

### Database

* MongoDB
* Mongoose

### Tools / Libraries

* React Bootstrap
* Redux
* Redux Thunk
* react-use-cookie
* bcrypt
* uuid
* dotenv
* cors

---

## Repository Structure

* `/client` — frontend application
* `/server` — backend application
* `/server/models` — database models
* `/server/routes` — API routes
* `/server/controllers` — controller logic
* `/server/middleware` — middleware
* `/ai` — AI documentation
* `/ai/features` — feature specifications
* `/LeetCode-Challenges` — challenge screenshots
* `README.md`
* `Research.md`
* `CONCEPTS.md`
* `PostmanCollection.json`

---

## Rules for the AI

* Use junior-friendly code.
* Follow the existing project structure.
* Reuse existing files whenever possible.
* Avoid unnecessary libraries.
* Avoid advanced patterns and over-engineering.
* Preserve all existing Module 09 functionality.
* Maintain the existing CodeBloggs color palette.
* Do not implement features outside the approved scope.
* Clearly label Backend work with **BE**.
* Clearly label Frontend work with **FE**.
* Respect existing MERN architecture and coding conventions.
* Explain generated changes briefly when appropriate.
* All JavaScript must use **ES Module syntax (ESM6)** — do not use CommonJS (`require` / `module.exports`).

---

## Code Quality Requirements

Every generated or modified file must contain:

* A **comments-based Table of Contents** at the top of the file describing its sections at a glance (see style guide below)
* Clear inline comments explaining important logic
* Notes explaining implementation decisions
* Warnings for known limitations using `// ⚠️`

### Comments TOC

Every file must open with a comment block that maps its contents — modelled on the style used in `client/src/styles/theme.css`:

```javascript
// =============================================================================
// controllers/user.controller.js — User API handlers
// -----------------------------------------------------------------------------
// 1. getUsers          GET  /user         — retrieve all users
// 2. getUserById       GET  /user/:id     — retrieve a single user
// 3. updateUser        PATCH /user/:id    — update user fields
// 4. deleteUser        DELETE /user/:id   — delete user + cascade posts/comments
// =============================================================================
```

```css
/* ==========================================================================
   ComponentName — short description
   --------------------------------------------------------------------------
   1.  Variables & Layout      selectors
   2.  States                  .component--modifier
   3.  Responsive              @media (max-width: ...)
   ========================================================================== */
```

### Inline Comment Style

Comments must explain **why** a decision was made, not just what the code does. Model all comments after `server/controllers/comment.controller.js`:

**Why-comments** — explain constraints, invariants, and non-obvious decisions:

```javascript
// user_id is always taken from the validated session (set by requireSession
// middleware) — never from the request body, so clients cannot impersonate
// another user.
const user_id = req.user._id;

// time_stamp is always generated server-side so clients cannot supply
// backdated or future-dated values.
const time_stamp = new Date().toISOString();
```

**`// ⚠️` warnings** — flag important constraints and cross-system invariants:

```javascript
// ⚠️ likes is always set to 0 server-side on create (never read from the body).

// ⚠️ Two-way Post ↔ Comment link: the Comment stores post_id, AND the Post
// stores the comment's _id in its comments[]. Both sides must stay in sync.
await Post.findByIdAndUpdate(post_id, { $push: { comments: comment._id } });
```

### JavaScript Standard

All JavaScript must use **ES Module syntax (ESM6)**. Do not use CommonJS.

| Use | Avoid |
|-----|-------|
| `import x from 'y'` | `const x = require('y')` |
| `export default x` | `module.exports = x` |
| `export { x }` | `module.exports = { x }` |

### Implementation Logs

An implementation log must be created for every completed feature in:

```
Working/Module_10/Implementation_Logs/
```

Name each log with a `FE_` or `BE_` prefix to indicate which end it covers:

```
FE_<feature-name>.md
BE_<feature-name>.md
```

Each log must summarize:

* Files created
* Files modified
* Decisions made
* Deviations from specification
* Known issues

---

## How to Run / Test the Project

### Install Dependencies

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd client
npm install
```

### Run Backend

```bash
npm start
```

or

```bash
npm run dev
```

### Run Frontend

```bash
npm run dev
```

### Environment Variables

Server `.env`

```env
PORT=
MONGO_URI=
CLIENT_ORIGIN=
```

### Verification

* Confirm MongoDB connection succeeds
* Confirm server starts without errors
* Confirm frontend builds successfully
* Confirm API endpoints function through Postman

---

## Definition of Done

* [ ] User Manager implemented
* [ ] User Update implemented
* [ ] User Delete implemented
* [ ] User Cascade Delete implemented
* [ ] Post Delete implemented
* [ ] Post Cascade Delete implemented
* [ ] Comment Delete implemented
* [ ] Content Manager implemented
* [ ] Search functionality implemented
* [ ] Date filtering implemented
* [ ] Pagination implemented
* [ ] Results-per-page controls implemented
* [ ] Skeleton loaders implemented
* [ ] Responsive navigation implemented
* [ ] README.md updated
* [ ] Research.md updated
* [ ] AI specifications completed
* [ ] Feature specifications completed
* [ ] Postman collection updated
* [ ] CONCEPTS.md completed
* [ ] Application runs without errors
* [ ] MongoDB connection succeeds
* [ ] Frontend builds successfully
* [ ] All required Module 10 requirements are satisfied
* [ ] Final project merged into main branch
* [ ] All generated/modified files include a comments-based TOC at the top
* [ ] All generated/modified files include inline why-comments on important logic
* [ ] Implementation log created for each completed feature (`FE_` or `BE_` prefix in `Working/Module_10/Implementation_Logs/`)
