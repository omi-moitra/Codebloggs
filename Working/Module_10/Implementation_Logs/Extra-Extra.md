# Extra-Extra — Beyond-Spec Enhancements

This log tracks features and improvements added beyond the graded M10 specification.

---

## 1. Content Manager — Sortable Author and Date Columns

**File modified:** `client/src/pages/ContentManager.jsx`  
**Date:** 2026-06-22

### What was added

The Content Manager post table gained clickable sort headers on the **Author** and **Date** columns, matching the sort UX already present on the User Manager table.

- Clicking **Author** sorts posts alphabetically by the resolved author name (first + last) — asc on first click, toggles desc on repeat click
- Clicking **Date** sorts by `time_stamp` — **defaults to descending (newest first) on initial load**, so the most recent content is immediately visible without any interaction
- Clicking the active column again flips the sort direction; clicking a new column resets to ascending
- Sort icons reuse the existing `.user-manager__sort-icon` / `.user-manager__col-header` CSS classes for visual consistency with the User Manager

### Implementation notes

- The **Date** sort uses lexicographic string comparison on ISO 8601 timestamps — this works correctly without a `Date` conversion because ISO strings are naturally ordered.
- The **Author** sort resolves names through `getAuthorLabel(post, usersById)` inside the `sorted` useMemo, so the computed display name (not the raw `user_id`) drives the alphabetical order.
- Sort state (`sortField`, `sortDir`) is component-local — it does not persist in Redux.
- `handleSort` resets `currentPage` to 1 so the admin always sees the top of the new order after a column click.
- Pagination math (`totalPages`, `pageSlice`) was updated to operate on `sorted` (the post-filter, post-sort array) instead of `filtered`.
- Imported `BsCaretUpFill`, `BsFillCaretDownFill` from `react-icons/bs` and `TbCaretUpDownFilled` from `react-icons/tb` — same packages already used by User Manager.

### Visual outcome

| Column | Sortable | Default on load |
|---|---|---|
| Author | ✅ asc / desc | neutral (no sort) |
| Post | ❌ | — |
| Date | ✅ asc / desc | **desc (newest first)** |
| Delete | ❌ | — |
