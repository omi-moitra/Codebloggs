# FE — Reactive Design (Skeleton Loaders) — Implementation Log

## Files Created

| File | Purpose |
|---|---|
| `client/src/components/Skeleton.css` | `@keyframes skeleton-pulse` animation + `.skeleton-bar` / `.skeleton-bar--field` styles |
| `client/src/components/SkeletonRow.jsx` | Generic table row with `cols` animated `<td>` cells |
| `client/src/components/SkeletonTable.jsx` | `<tbody>` of `rows` × `SkeletonRow` instances; imports `Skeleton.css` |
| `client/src/components/SkeletonField.jsx` | Single full-width skeleton bar for form fields; imports `Skeleton.css` |
| `Working/Module_10/Implementation_Logs/FE_reactive-design.md` | This log |

## Files Modified

| File | Change |
|---|---|
| `client/src/redux/actions/actionTypes.js` | Added `SET_USERS_LOADING` and `SET_POSTS_LOADING` constants |
| `client/src/redux/reducers/userReducer.js` | Handle `SET_USERS_LOADING`; `DELETE_USER_SUCCESS/FAILURE` now clear `loading` |
| `client/src/redux/reducers/postReducer.js` | Handle `SET_POSTS_LOADING`; `DELETE_POST_SUCCESS/FAILURE` now clear `loading` |
| `client/src/redux/actions/userActions.js` | `deleteUserAction` dispatches `SET_USERS_LOADING: true` before DELETE |
| `client/src/redux/actions/postActions.js` | `deletePostAction` dispatches `SET_POSTS_LOADING: true` before DELETE |
| `client/src/pages/UserManager.jsx` | Removed full-page spinner; `<tbody>` conditionally renders `<SkeletonTable>`; search inputs `disabled` while loading; pagination hidden while loading |
| `client/src/pages/ContentManager.jsx` | Same pattern as UserManager; date filter inputs disabled; pagination hidden |
| `client/src/pages/EditUserPage.jsx` | Removed early-return spinner; form fields replaced by `<SkeletonField />` while `loadingUser` is true; password fields hidden until data resolves; Save Changes disabled during load |

## Decisions Made

**Why `SET_USERS_LOADING` / `SET_POSTS_LOADING` instead of reusing `FETCH_USERS_REQUEST`?**
The `FETCH_USERS_REQUEST` action already sets `loading: true` for the initial data load. Using the same action for delete would be semantically misleading (a fetch action triggering a delete skeleton). Separate `SET_*_LOADING` actions make the intent clear and keep the reducer easy to follow.

**Why does `DELETE_USER_SUCCESS` / `DELETE_USER_FAILURE` clear `loading`?**
Previously these cases did not touch `loading`. Since `deleteUserAction` now sets `loading: true` before the DELETE, the reducer must clear it on both outcomes so the skeleton doesn't persist indefinitely on error.

**Why remove the full-page spinner early return in UserManager and ContentManager?**
The skeleton replaces it. The early return rendered outside the normal component tree, which prevented the search inputs and table headers from being visible during load. The skeleton approach keeps the layout stable — headers visible, inputs shown (disabled), only the `<tbody>` replaced.

**Why hide password fields during loading on EditUserPage?**
The feature spec Screen 3 mockup explicitly shows password fields absent during the fallback fetch, with a note: "(password fields hidden until data resolves)". Rendering them blank while the skeleton shows and then revealing them on resolve matches this UX intent.

**`rows` prop = `pageSize`:**
`SkeletonTable` is always called with `rows={pageSize}` from the parent component so the skeleton occupies the exact same vertical space as a full data page — preventing layout shift when real rows appear.

## Deviations from Specification

None. All acceptance criteria are addressed.

## Known Issues

- The delete skeleton in UserManager/ContentManager is partially obscured by the open ConfirmModal (which stays open during the delete). The skeleton is visible briefly when the modal closes before `loading` clears. This matches the expected UX — the spec does not require the skeleton to be visible behind the modal.
- `Skeleton.css` is imported in both `SkeletonTable.jsx` and `SkeletonField.jsx`. Standard bundlers (Vite) de-duplicate CSS imports so the styles are injected once — no visual issue.
