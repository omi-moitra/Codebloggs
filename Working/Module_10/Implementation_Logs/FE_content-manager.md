# FE Implementation Log — Content Manager

**Feature:** Content Manager  
**Spec:** `ai/Module_10/features/frontend/content-manager.feature.md`  
**Date:** 2026-06-22  
**Role:** Frontend

---

## Files Created

| File | Purpose |
|---|---|
| `client/src/pages/ContentManager.jsx` | New page component at `/admin/content` |
| `client/src/redux/actions/postActions.js` | Redux Thunks: `fetchPosts`, `deletePostAction` |
| `client/src/redux/reducers/postReducer.js` | Post list state slice |

---

## Files Modified

| File | Change |
|---|---|
| `client/src/redux/actions/actionTypes.js` | Added `FETCH_POSTS_REQUEST/SUCCESS/FAILURE`, `DELETE_POST_SUCCESS/FAILURE` |
| `client/src/services/postService.js` | Added `deletePost(postId)` — calls `DELETE /posts/:id` |
| `client/src/redux/reducers/index.js` | Registered `postReducer` under `posts` key in `combineReducers` |
| `client/src/main.jsx` | Replaced placeholder div at `admin/content` with `<ContentManager />`; added import |
| `client/src/styles/theme.css` | Added `.content-manager` CSS block (section 13c) |
| `Working/Module_10/Integration.md` | Updated Content Manager section with status: ✅ Frontend implemented |

---

## Decisions Made

- **Client-side date filter** — `GET /posts` is called once on mount and the full post array is stored in Redux. The date filter operates on the in-memory array (consistent with the User Manager name-search pattern, and confirmed in Issues.md Issue #13). No additional API call is made when the date filter changes.
- **Author column fallback** — `getAuthorLabel` checks `post.first_name`/`post.last_name` first, then `post.author.first_name`/`post.author.last_name`, then `post.user_id`. This handles both a flat populated response and a nested author object, and gracefully shows the ID if the backend does not populate author names. See Integration.md for the backend contract note.
- **Post column title/excerpt** — `getPostLabel` uses `post.title` if present; otherwise truncates `post.content` at 40 characters. This is necessary because the M9 post schema may not include a separate `title` field.
- **Date comparison** — String comparison on ISO 8601 timestamps (e.g., `"2025-06-01T12:00Z" >= "2025-06-01"`) works correctly because ISO strings are lexicographically ordered. The end date is padded with `T23:59:59` so posts created at any time on the To date are included.
- **"Select All" button label** — Must be `Select All` (not "Clear") — the grading sheet checks this exact label for Content Manager (Issues.md Issue #12).
- **Pagination hidden when empty** — The spec requires pagination controls to be hidden when no posts match the filter. Implemented with `{filtered.length > 0 && ...}`.
- **`posts` Redux key** — The state slice is registered as `state.posts` (matching the `combineReducers` key `posts`), not `state.post`. `ContentManager` reads `state.posts.posts` — the outer key is the slice, the inner key is the array inside `postReducer`'s `initialState`.

---

## Deviations from Specification

None. All acceptance criteria from `content-manager.feature.md` are met.

---

## Known Issues

- `DELETE /posts/:id` is a new M10 endpoint — not yet delivered by the backend partner. The graceful fallback inline alert will display until the endpoint is live. No code changes are required once the endpoint exists.
- Author name population depends on the backend `GET /posts` response shape. If the partner's response does not include `first_name`/`last_name` inline, the Author column will show the raw `user_id`. See `Working/Module_10/Integration.md` — Dependency 1 note for the required shape.
