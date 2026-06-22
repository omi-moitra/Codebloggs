# Issues & Discrepancies Log — Module 10 CodeBloggs

> This file records all conflicts, ambiguities, and unresolved questions found when cross-referencing the four source documents (grading sheet CSV, project-breakdown.md, M10_Slides.txt, m10-business-document-EN.pdf) against the ai-spec.md and feature specifications.
>
> **Scope note:** This project splits responsibilities — this student owns the **frontend only**; the backend is implemented by a partner. MongoDB is already connected with real data.
>
> Each issue uses the format: **What / Where / Why / Potential Solutions / Discussion / Decision / Lingering Issues**

---

## Table of Contents

1. [Admin Page Foundation Has No Dedicated Feature Spec](#1-admin-page-foundation-has-no-dedicated-feature-spec)
2. [Edit User: Modal (project-breakdown) vs Separate Page (ai-spec)](#2-edit-user-modal-project-breakdown-vs-separate-page-ai-spec)
3. [Sorting Requirement in Slides — Missing from project-breakdown.md](#3-sorting-requirement-in-slides--missing-from-project-breakdownmd)
4. [Feature File Naming Conflicts: ai-spec vs project-breakdown](#4-feature-file-naming-conflicts-ai-spec-vs-project-breakdown)
5. [schema-usage and server-configuration Feature Files: In ai-spec, Not in project-breakdown](#5-schema-usage-and-server-configuration-feature-files-in-ai-spec-not-in-project-breakdown)
6. [Route Path Inconsistency: /user (ai-spec) vs /api/users (project-breakdown)](#6-route-path-inconsistency-user-ai-spec-vs-apiusers-project-breakdown)
7. [Skeleton Loaders: Core vs Extra Mile — Now Resolved](#7-skeleton-loaders-core-vs-extra-mile--now-resolved)
8. [ai-spec Does Not Reflect Frontend-Only Responsibility Split](#8-ai-spec-does-not-reflect-frontend-only-responsibility-split)
9. [Feature File Paths Don't Match Grading Sheet](#9-feature-file-paths-dont-match-grading-sheet)
10. [Research.md Missing Third Requirement: Project Setup Instructions](#10-researchmd-missing-third-requirement-project-setup-instructions)
11. [User Update "Return to Manager" Requirement with Modal Approach](#11-user-update-return-to-manager-requirement-with-modal-approach)
12. [Content Manager: "Select All" Button (not "Clear")](#12-content-manager-select-all-button-not-clear)

---

## 1. Admin Page Foundation Has No Dedicated Feature Spec

**What the issue is:**
"Admin Page Foundation" is the first story in the Frontend section of `project-breakdown.md`. It covers creating the `/admin` route with role-based access and building the admin tab navigation. However, no `admin-page-foundation.feature.md` (or equivalent) appears in the ai-spec Feature Index or in the project-breakdown's AI Specification Documents task list.

**Where it came up:**
- `Working/Module_10/Omi_ProjectBreakdown/project-breakdown.md` — Frontend > Story: Admin Page Foundation
- `ai/Module_10/ai-spec.md` — Feature Index (no entry for admin foundation)
- `project-breakdown.md` — Documentation > AI Specification Documents sub-tasks (no entry for admin foundation)

**Why it came up (sources of confusion):**
The project-breakdown organizes work into implementation stories at one granularity; the ai-spec organizes features into spec files at a different granularity. Admin Page Foundation is shared infrastructure enabling both User Manager and Content Manager — it doesn't map cleanly to either feature file.

**Potential solutions:**
- (a) Absorb it into `user-manager.feature.md` as a prerequisite section
- (b) Create a separate `admin-foundation.feature.md` (adds a file not listed in any index)

**Discussion had with user:**
Not yet discussed.

**Decision made:**
Absorbed into `user-manager.feature.md` as a prerequisite section with a note that the Content Manager feature will reuse the shell generated here.

**Lingering issues:**
When writing `content-manager.feature.md`, note that the Admin Page Shell already exists and must NOT be regenerated.

---

## 2. Edit User: Modal (project-breakdown) vs Separate Page (ai-spec)

**What the issue is:**
The project-breakdown describes the Edit User UI as "Build user edit modal/form" — implying an in-page modal overlay. The ai-spec defines `/admin/users/:id` as a dedicated route (a separate page) with a corresponding `user-update.feature.md` feature file.

**Where it came up:**
- `project-breakdown.md` — Frontend > Story: User Manager — Edit User > Task: "Build user edit modal/form"
- `ai/Module_10/ai-spec.md` — Pages/Screens > `/admin/users/:id — user update page`
- `ai/Module_10/ai-spec.md` — Feature Index > `user-update.feature.md`

**Why it came up (sources of confusion):**
The M10_Slides.txt uses ambiguous language: "When clicking on a User, this should take you to a details page (or open a modal)." Both patterns are described as acceptable. The project-breakdown chose "modal" in its task language while the ai-spec chose a dedicated route.

**Potential solutions:**
- (a) Dedicated route `/admin/users/:id` — matches ai-spec, aligns with `user-update.feature.md`
- (b) In-page modal — simpler; matches project-breakdown task language

**Discussion had with user:**
User confirmed modal approach on 2026-06-22.

**Decision made:**
Option (b) — in-page modal. The Edit User UI is a modal overlay that opens from the User Manager table row. There is no `/admin/users/:id` route. `user-update.feature.md` describes the modal component. `user-manager.feature.md` has been updated to reflect this: Edit column opens the modal; the selected user's data is passed as a prop.

**Lingering issues:**
The `/admin/users/:id` route listed in ai-spec.md Pages/Screens is now obsolete — it should be removed from the ai-spec to avoid confusing the AI into creating an unused route.

---

## 3. Sorting Requirement in Slides — Missing from project-breakdown.md

**What the issue is:**
`M10_Slides.txt` explicitly states: "you should be able to sort the list of Users alphabetically by first name, or last name." This is not listed in any User Manager story in `project-breakdown.md`.

**Where it came up:**
- `Working/Module_10/Source_material/M10_Slides.txt` — Admin Section > User Manager paragraph
- `project-breakdown.md` — Frontend > User Manager stories (no sort sub-task)

**Why it came up (sources of confusion):**
The project-breakdown was compiled from the grading sheet CSV, which may not have a discrete graded line item for column sorting. The slides include UX details that don't always appear in the grading rubric.

**Potential solutions:**
- (a) Include sorting — slides say to do it; client-side, low-effort
- (b) Omit sorting — strict grading-sheet scope

**Discussion had with user:**
Not yet discussed.

**Decision made:**
Included in `user-manager.feature.md`. Flagged here so the user can remove it if strict grading-sheet scope is preferred.

**Lingering issues:**
Verify against grading sheet CSV whether column sorting is a graded item.

---

## 4. Feature File Naming Conflicts: ai-spec vs project-breakdown

**What the issue is:**
The ai-spec Feature Index and project-breakdown documentation sub-tasks list different file names for the same features:

| ai-spec Feature Index | project-breakdown docs sub-tasks |
|---|---|
| `user-endpoint.feature.md` | `user-endpoints.feature.md` (plural) |
| `post-endpoint.feature.md` | `post-endpoints.feature.md` (plural) |
| `comment-endpoint.feature.md` | `comment-endpoints.feature.md` (plural) |
| `reactive-design.feature.md` | `skeleton-loaders.feature.md` |
| `responsive-design.feature.md` | `responsive-navbar.feature.md` |

**Where it came up:**
- `ai/Module_10/ai-spec.md` — Feature Index
- `project-breakdown.md` — Documentation > AI Specification Documents sub-tasks

**Why it came up (sources of confusion):**
Two documents created at different times without naming coordination. ai-spec uses conceptual names; project-breakdown uses implementation-specific names.

**Note:** The backend endpoint files (`user-endpoint`, `post-endpoint`, `comment-endpoint`) belong to the partner. The frontend naming conflict (`reactive-design` vs `skeleton-loaders`, `responsive-design` vs `responsive-navbar`) is the more immediately relevant concern.

**Potential solutions:**
- (a) Use ai-spec names — it is the authoritative global doc
- (b) Use project-breakdown names — more descriptive
- (c) Update ai-spec Feature Index to match project-breakdown names

**Discussion had with user:**
Not yet discussed.

**Decision made:**
Using ai-spec names for now. Feature files will be clearly titled internally regardless of file name.

**Lingering issues:**
ai-spec Feature Index should be updated once a naming convention is chosen. Affects all remaining frontend feature specs.

---

## 5. schema-usage and server-configuration Feature Files: In ai-spec, Not in project-breakdown

**What the issue is:**
The ai-spec Feature Index includes `schema-usage.feature.md` and `server-configuration.feature.md`, which do not appear in the project-breakdown documentation task list.

**Where it came up:**
- `ai/Module_10/ai-spec.md` — Feature Index (first two entries)
- `project-breakdown.md` — Documentation > AI Specification Documents sub-tasks (not listed)

**Why it came up (sources of confusion):**
These may have been added as supplementary AI context docs without corresponding grading items. Both describe backend concerns — they belong to the partner's scope.

**Potential solutions:**
- (a) Partner creates them as backend reference docs
- (b) Remove them from the ai-spec Feature Index
- (c) Leave in index, note they belong to backend developer

**Discussion had with user:**
Not yet discussed.

**Decision made:**
Pending user/partner decision. Not being created as part of the frontend feature spec work.

**Lingering issues:**
Coordinate with partner on ownership of these files.

---

## 6. Route Path Inconsistency: /user (ai-spec) vs /api/users (project-breakdown)

**What the issue is:**
The project-breakdown refers to the delete endpoint as `DELETE /api/users/:id`. The ai-spec specifies `DELETE /user/:id` (no `/api/` prefix; singular `user`). The frontend must call the correct path — this needs to be confirmed with the backend partner since MongoDB is live and the routes exist on the real server.

**Where it came up:**
- `project-breakdown.md` — Frontend > User Manager — Delete User > "DELETE /api/users/:id"
- `ai/Module_10/ai-spec.md` — Backend Routes > `DELETE /user/:id`

**Why it came up (sources of confusion):**
The project-breakdown appears to use a generic REST notation that may not match the actual Express route paths. The ai-spec reflects the documented route structure.

**Potential solutions:**
- (a) Use ai-spec routes (`/user/:id`) — confirm with partner
- (b) Ask partner to confirm the actual path before wiring the Redux action

**Discussion had with user:**
Not yet discussed.

**Decision made:**
`user-manager.feature.md` lists `DELETE /user/:id` (following ai-spec). Must be confirmed with backend partner. See `Integration.md` endpoint status table.

**Lingering issues:**
Coordinate with partner: is the Express route `/user/:id` or `/api/users/:id`? Update `Integration.md` and the Redux action URL once confirmed.

---

## 7. Skeleton Loaders: Core vs Extra Mile — Now Resolved

**What the issue is:**
Skeleton loaders appeared in `project-breakdown.md` as both a core requirement and an extra mile, with the distinction between them unexplained.

**Where it came up:**
- `project-breakdown.md` — Frontend > Story: Skeleton Loaders (Reactive Design) — core
- `project-breakdown.md` — Extra Miles table — also listed, with a note about a variant

**Why it came up (sources of confusion):**
The grading sheet was not read in full when the project-breakdown was written, so the extra-mile variant was unknown.

**Decision made:**
Resolved by reading the full grading sheet CSV on 2026-06-22. The distinction is now clear:
- **Core requirement** (`reactive-design.feature.md`): skeleton loaders in User Manager and Content Manager during loading operations
- **Extra mile**: *"Implement skeleton loaders for key views (e.g., posts, user cards) to indicate loading states across the app"* — broader coverage across the whole application beyond the admin section

**Lingering issues:**
None. Core scope is confirmed. Extra mile is clearly defined if pursued later.

---

## 8. ai-spec Does Not Reflect Frontend-Only Responsibility Split

**What the issue is:**
The current `ai/Module_10/ai-spec.md` describes both frontend and backend features without noting that they are owned by different developers. The AI may generate backend code that duplicates or conflicts with the partner's work.

**Where it came up:**
- `ai/Module_10/ai-spec.md` — In Scope section lists both BE and FE features without a responsibility note
- `ai/Module_10/ai-spec.md` — Rules for the AI section has no frontend-only caveat

**Why it came up (sources of confusion):**
The spec was written as a project-level document before the frontend/backend ownership split was established.

**Potential solutions:**
- (a) Add one line to the "Rules for the AI" section of ai-spec.md noting frontend-only scope for this student
- (b) Create a separate `ai-spec-frontend.md` (heavier but cleaner separation)

**Discussion had with user:**
User confirmed frontend-only responsibility on 2026-06-22.

**Decision made:**
Option (a) — add a single clarifying rule to ai-spec.md "Rules for the AI". Also add a matching note to the `Notes for the AI` section of every frontend feature spec (already done in `user-manager.feature.md`).

**Lingering issues:**
The ai-spec update should be done before the next AI coding session. All future frontend feature specs must include the "frontend-only" note in their "Notes for the AI" section.

---

## 9. Feature File Paths Don't Match Grading Sheet

**What the issue is:**
The grading sheet specifies all feature files at `./ai/features/<name>.feature.md` and the global spec at `./ai/ai-spec.md`. Our files are at `./ai/Module_10/features/frontend/`, `./ai/Module_10/features/backend/`, and `./ai/Module_10/ai-spec.md`. If the grader checks the expected paths, the files will not be found.

**Where it came up:**
- `FSD Grading Sheets (Shared) - m10.csv` — every AI Feature Specification line item specifies `./ai/features/<name>.feature.md` and `./ai/ai-spec.md`
- Our actual file locations: `./ai/Module_10/features/frontend/`, `./ai/Module_10/features/backend/`, `./ai/Module_10/ai-spec.md`

**Why it came up (sources of confusion):**
The ai-spec.md organizes files by module and by FE/BE layer (a reasonable convention for a multi-module project). The grading sheet expects a flat `./ai/features/` structure without module subdirectories. The project-breakdown flagged this as "Discrepancy #7" but marked it as "no true conflict" — that assessment was made before the grading sheet was read in full.

**Potential solutions:**
- (a) Move all files to match the grading sheet paths (`./ai/features/`, `./ai/ai-spec.md`) — lowest grading risk; requires moving existing files and updating all internal references
- (b) Keep current structure and add symlinks or copies at the grading sheet paths
- (c) Keep current structure and hope the grader accepts it — highest risk

**Discussion had with user:**
Flagged on 2026-06-22 after reading the full grading sheet CSV.

**Decision made:**
Pending user decision. This is the highest-priority structural issue — it affects every feature spec file in the project.

**Lingering issues:**
Decide before writing more feature specs. If moving to `./ai/features/`, all existing files (`ai-spec.md`, `user-manager.feature.md`) need to be moved and all cross-references updated.

---

## 10. Research.md Missing Third Requirement: Project Setup Instructions

**What the issue is:**
The grading sheet has three Research.md line items. The project-breakdown only captured two of them. The missing one is: *"Add a short section explaining how to set up and run the project (installation, environment variables, start commands, etc.)."*

**Where it came up:**
- `FSD Grading Sheets (Shared) - m10.csv` — Technical Requirements > "Resarch.md - Project Setup Instructions" (note: "Resarch" is a typo in the grading sheet; the file is Research.md)
- `project-breakdown.md` — Documentation > Research.md story (only lists reactive vs responsive and threshold justification)

**Why it came up (sources of confusion):**
The project-breakdown was built before the grading sheet was read in full. The third Research.md requirement was missed.

**Potential solutions:**
Add a "Project Setup" section to Research.md covering: installation steps, environment variables, and start commands for both client and server.

**Discussion had with user:**
Flagged on 2026-06-22 after reading the full grading sheet CSV.

**Decision made:**
Add to Research.md scope. Low effort — this content is largely a summary of what the README.md already covers.

**Lingering issues:**
None. Update the project-breakdown Research.md story to include this third requirement when next editing that document.

---

## 11. User Update "Return to Manager" Requirement with Modal Approach

**What the issue is:**
The grading sheet requires: *"A working Return link (or button) must redirect back to the User Manager page without applying any updates."* This language describes a page-navigation pattern. Since we chose a modal (Issue #2), there is no route navigation to "redirect back" from — closing the modal inherently returns the admin to the User Manager.

**Where it came up:**
- `FSD Grading Sheets (Shared) - m10.csv` — Feature: Frontend user update section > "User Update - Return to Manager Button"
- `Working/Module_10/Issues.md` — Issue #2 (modal decision confirmed 2026-06-22)

**Why it came up (sources of confusion):**
The grading sheet was written assuming a page-based edit flow. The modal decision was made after the grading sheet requirement was established.

**Potential solutions:**
- (a) Include a "Cancel" or "Return to User Manager" button inside the modal that closes it without saving — this satisfies the intent of the requirement in a modal context
- (b) Label the button explicitly "Return to User Manager" to match grading sheet language exactly

**Discussion had with user:**
Flagged on 2026-06-22.

**Decision made:**
The modal will include a clearly labelled **"Return to User Manager"** button (or "Cancel — Return to User Manager") that closes the modal without saving. This satisfies the grading sheet requirement while fitting the modal pattern.

**Lingering issues:**
Make sure `user-update.feature.md` includes this button in its Sub-Requirements and Acceptance Criteria with the explicit label.

---

## 12. Content Manager: "Select All" Button (not "Clear")

**What the issue is:**
The grading sheet requires a **"Select All"** button for the Content Manager: *"A Select All button retrieves all posts regardless of filters."* This is functionally similar to the "Clear" button in the User Manager (resets filters and shows everything) but uses a different name. The two features must use the correct button label for each.

**Where it came up:**
- `FSD Grading Sheets (Shared) - m10.csv` — Feature: Frontend content manager section > "Content Manager - Select All Button"
- `user-manager.feature.md` uses "Clear" (correct for User Manager)

**Why it came up (sources of confusion):**
Both buttons reset filters and restore the full list, but the grading sheet uses different terminology for each panel. "Clear" for User Manager; "Select All" for Content Manager.

**Potential solutions:**
Use the exact names from the grading sheet: "Clear" in User Manager, "Select All" in Content Manager.

**Discussion had with user:**
Flagged on 2026-06-22.

**Decision made:**
User Manager spec uses "Clear" ✅. Content Manager spec must use "Select All" — note this when writing `content-manager.feature.md`.

**Lingering issues:**
Ensure `content-manager.feature.md` uses "Select All" as the button label, not "Clear".
