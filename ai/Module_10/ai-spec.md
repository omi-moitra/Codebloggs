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
