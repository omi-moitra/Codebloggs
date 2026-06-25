# Module 10 — CodeBloggs Project Breakdown

> **Source of truth:** FSD Grading Sheet (`FSD Grading Sheets (Shared) - m10.csv`).
> All other sources (business doc, slides, walkthrough video) cross-referenced and noted where they conflict.

---

## ⚠️ Discrepancy Alerts

Read these before you start. They represent conflicts or ambiguities found across the four source documents.

| # | Issue | Source Conflict | Decision |
|---|-------|-----------------|----------|
| 1 | **Research.md vs README.md overlap** | Grading sheet requires a standalone `Research.md`. Business doc and slides *also* say README.md must explain reactive vs. responsive design. These cover the same topic. | Treat as two separate documents. Research.md = deep research doc. README.md = project overview that also summarizes the concept. Confirm with coach if you're unsure whether the README explanation can simply link to Research.md. |
| 2 | **Module 9 loose ends** | Slides explicitly say "continuation from M9 with loose ends to finish." Neither the grading sheet nor the business doc specifies what those loose ends are. | Audit your M9 repo before starting M10. Identify and complete any unfinished M9 work before building new features. |
| 3 | **URL scheme access rules (Extra Mile)** | Listed in the grading sheet Extras section. Not explained, defined, or referenced in any other source document. No implementation detail exists. | Scope undefined. Do not attempt without clarifying with a coach first. |
| 4 | **Updated résumé** | Business doc lists it as a deliverable. Grading sheet does not have an explicit line item for it (covered loosely under Soft/Pro Skills). | Low grading risk but do it anyway. Business doc represents the client — it should be done. |
| 5 | **Wireframe analysis document** | Business doc lists it as a required deliverable. Grading sheet does not grade it as a standalone item (the admin page navigation is graded, not the analysis doc itself). | Treat as required per business doc. It demonstrates professional process. |
| 6 | **RxJS vs Redux — do not confuse** | Business doc mandates Redux + redux-thunk as the required tech stack. Grading sheet lists RxJS reactive state management as an **Extra Mile only** — not a core requirement. These are two entirely different tools. | Use Redux + redux-thunk for state management (required). Only add RxJS if pursuing that extra mile intentionally. |
| 7 | **ai-spec.md file path** | Business doc says `./ai/ai-spec.md` and `./ai/features/`. Slides call feature files `<feature-name>.feature.md`. Grading sheet confirms this structure. | No true conflict — just documenting the convention. Use `./ai/ai-spec.md` and `./ai/features/<feature-name>.feature.md`. |

---

## Frontend

### Story: Admin Page Foundation

**Purpose:** Create the admin section of the app with protected routing and tab-based navigation.

#### Task: Create admin route and page component
Set up a React route for the admin area and build the base admin page component.
- **Sub-task:** Restrict admin route to admin role only — redirect non-admin users away from `/admin`

#### Task: Implement admin navigation (User Manager / Content Manager)
Build a navigation component (tabs or links) allowing admins to switch between the two admin panels.

---

### Story: User Manager — List & Search

**Purpose:** Display a paginated, searchable table of all users for admin management.

#### Task: Build User Manager data table component
Create the table UI that fetches and renders user data.
- **Sub-task:** Display paginated list — default 10 users per page
- **Sub-task:** Add results-per-page dropdown — options: 10 / 15 / 20
- **Sub-task:** Connect component to Redux store for user data

#### Task: Implement user search by first/last name
- **Sub-task:** Add search input field (first and/or last name)
- **Sub-task:** Wire search input to Redux action and API call

---

### Story: User Manager — Edit User

**Purpose:** Allow admins to update user information including password, with validation.

#### Task: Build user edit modal/form
- **Sub-task:** Pre-populate form fields with the selected user's existing data
- **Sub-task:** Add password field with matching password-confirmation validation

#### Task: Implement edit confirmation modal
Show a confirmation modal before submitting the edit request.

#### Task: Wire edit form to Redux action and PUT/PATCH endpoint
Dispatch the update action on confirmation, handle success and error states.

---

### Story: User Manager — Delete User

**Purpose:** Allow admins to delete a user, triggering cascade delete on the backend.

#### Task: Implement delete button with confirmation modal
Show a confirmation prompt before sending the delete request.

#### Task: Wire delete to Redux action and DELETE /api/users/:id endpoint
Dispatch the delete action on confirmation, remove user from Redux store on success.

---

### Story: Content Manager — List & Date Filtering

**Purpose:** Display a paginated, date-filterable table of all posts for admin management.

#### Task: Build Content Manager data table component
- **Sub-task:** Display paginated list — default 10 posts per page
- **Sub-task:** Add results-per-page dropdown
- **Sub-task:** Connect component to Redux store for post data

#### Task: Implement date range filter
- **Sub-task:** Add date range input fields (start date / end date)
- **Sub-task:** Wire date filter to Redux action and API call

---

### Story: Content Manager — Delete Post

**Purpose:** Allow admins to delete a post, triggering cascade delete of its comments on the backend.

#### Task: Implement delete post button with confirmation modal
Show a confirmation prompt before sending the delete request.

#### Task: Wire delete to Redux action and DELETE /api/posts/:id endpoint
Dispatch delete action on confirmation, remove post from Redux store on success.

---

### Story: Skeleton Loaders (Reactive Design)

**Purpose:** Show loading skeleton bars during data fetches and CRUD operations to improve perceived performance.

#### Task: Add skeleton loaders to User Manager
- **Sub-task:** Show skeleton during initial data fetch (table loading state)
- **Sub-task:** Show skeleton during edit and delete operations

#### Task: Add skeleton loaders to Content Manager
- **Sub-task:** Show skeleton during initial data fetch (table loading state)
- **Sub-task:** Show skeleton during delete operations

---

### Story: Responsive Navbar

**Purpose:** Adapt the navigation bar for small screens — horizontal layout below a justified breakpoint.

#### Task: Implement horizontal navbar for mobile view
- **Sub-task:** Define breakpoints and document the justification for each (required in README.md)
- **Sub-task:** Write CSS media queries for mobile / tablet / desktop views
- **Sub-task:** Test on multiple device types using browser DevTools

---

## Backend

### Story: Update User Endpoint

**Purpose:** Expose a PUT/PATCH endpoint that allows updating user fields.

#### Task: Create PUT/PATCH /api/users/:id endpoint
- **Sub-task:** Validate request body fields
- **Sub-task:** Hash the updated password if a new password is provided
- **Sub-task:** Return the updated user data in the response

---

### Story: Delete User Endpoint (Cascade)

**Purpose:** Expose a DELETE endpoint that removes a user and all their related data.

#### Task: Create DELETE /api/users/:id endpoint
- **Sub-task:** Find and delete all posts belonging to the user
- **Sub-task:** For each of those posts, delete all associated comments
- **Sub-task:** Delete the user record itself
- **Sub-task:** Return success response

---

### Story: Delete Post Endpoint (Cascade)

**Purpose:** Expose a DELETE endpoint that removes a post and all its comments.

#### Task: Create DELETE /api/posts/:id endpoint
- **Sub-task:** Find and delete all comments on the post
- **Sub-task:** Delete the post record
- **Sub-task:** Return success response

---

### Story: Delete Comment Endpoint

**Purpose:** Expose a DELETE endpoint that removes a single comment.

#### Task: Create DELETE /api/comments/:id endpoint
- **Sub-task:** Delete the comment record
- **Sub-task:** Return success response

---

### Story: Schema Validation

**Purpose:** Ensure all Mongoose schemas are complete, correct, and match the expected data structure per the grading sheet.

#### Task: Validate and finalize User schema
#### Task: Validate and finalize Session schema
#### Task: Validate and finalize Post schema
#### Task: Validate and finalize Comment schema

---

## Documentation

### Story: AI Specification Documents

**Purpose:** Create the spec-driven AI workflow documents used to guide AI code generation per the module methodology.

#### Task: Create global `./ai/ai-spec.md`
- **Sub-task:** Document project architecture and conventions
- **Sub-task:** Document database schema (all four models)
- **Sub-task:** Document API structure (routes, methods, expected shapes)

#### Task: Create feature spec files in `./ai/features/`
- **Sub-task:** `user-manager.feature.md`
- **Sub-task:** `content-manager.feature.md`
- **Sub-task:** `skeleton-loaders.feature.md`
- **Sub-task:** `responsive-navbar.feature.md`
- **Sub-task:** `user-endpoints.feature.md`
- **Sub-task:** `post-endpoints.feature.md`
- **Sub-task:** `comment-endpoints.feature.md`

---

### Story: README.md

**Purpose:** Provide complete project documentation for the repo.

#### Task: Write project description and tech stack section
#### Task: Write project structure section
#### Task: Write installation and setup instructions
#### Task: Document all environment variables
#### Task: Write API documentation section (all endpoints)
#### Task: Add reactive vs. responsive design explanation (+ breakpoint justification)

---

### Story: Research.md

**Purpose:** Standalone research document comparing reactive and responsive design.
> ⚠️ See Discrepancy #1 — this overlaps with README.md content. Confirm with coach.

#### Task: Research reactive vs. responsive design concepts
#### Task: Write Research.md comparing both concepts in depth

---

### Story: CONCEPTS.md

**Purpose:** Document 3 technically challenging concepts encountered in the project for the interview video.

#### Task: Identify 3 challenging technical concepts from the project
#### Task: Document each concept — purpose, why challenging, where it's used in the codebase

---

### Story: Postman Collection

**Purpose:** Maintain an up-to-date PostmanCollection.json covering all M10 endpoints.

#### Task: Add update user request to PostmanCollection.json
#### Task: Add delete user request to PostmanCollection.json
#### Task: Add delete post request to PostmanCollection.json
#### Task: Add delete comment request to PostmanCollection.json

---

### Story: GitHub Workflow

**Purpose:** Follow the required branching and commit convention throughout development.

#### Task: Set up branching structure — `main` / `dev` / `feature/*`
#### Task: Follow commit message convention — imperative mood, issue references, keywords (feat, fix, chore, docs, style, test)
#### Task: Create and merge PRs following the procedure in the slides (review, resolve, implement)

---

### Story: Wireframe Analysis Document

**Purpose:** Document wireframe analysis for each M10 feature.
> ⚠️ See Discrepancy #5 — required per business doc; not a standalone grading line item. Still do it.

#### Task: Document wireframe analysis for each of the 4 main features (User Manager, Content Manager, Skeleton Loaders, Responsive Navbar)

---

## Interview & Submission

### Story: LeetCode Challenges

**Purpose:** Solve 5 LeetCode problems, save screenshots, and prepare to explain reasoning on video.

#### Task: Solve challenge 1 + save screenshot to `./LeetCode-Challenges/<challenge-name>.png`
#### Task: Solve challenge 2 + save screenshot
#### Task: Solve challenge 3 + save screenshot
#### Task: Solve challenge 4 + save screenshot
#### Task: Solve challenge 5 + save screenshot

---

### Story: Interview Videos

**Purpose:** Record the three required videos demonstrating concepts, problem-solving, and the live product.

#### Task: Record CONCEPTS explanation video (5–10 min) — explain 3 concepts from CONCEPTS.md in your own words
#### Task: Record LeetCode problem-solving video (5–10 min) — walk through reasoning behind solutions
#### Task: Record technical demo + code overview video (10–15 min max) — functional demo + code explanation

---

### Story: Submission Package

**Purpose:** Package and submit all deliverables through the platform.

#### Task: Create submission summary document — include name, repo link, all video links, credentials
> ⚠️ Do NOT commit the submission summary to GitHub.

#### Task: Merge dev branch to main — only the main branch is graded
#### Task: Submit through the platform with the submission summary document

---

## Extra Miles (Optional)

These are bonus items from the grading sheet. Pursue only after core requirements are complete.

| Extra Mile | Notes |
|---|---|
| SQL / relational database theory | Additional DB concepts |
| Skeleton loaders | Already in core requirements — check grading sheet for any extra-mile variant |
| URL scheme access rules | ⚠️ Scope undefined — clarify with coach before attempting (Discrepancy #3) |
| Reactive state management with RxJS | ⚠️ This is EXTRA MILE only. Do not replace Redux with RxJS (Discrepancy #6) |
