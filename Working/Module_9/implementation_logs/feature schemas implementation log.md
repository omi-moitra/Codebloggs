# Feature Schemas (Mongoose Models) Implementation Log

## Files Created

- `server/schemas/User.js`
- `server/schemas/Session.js`
- `server/schemas/Post.js`
- `server/schemas/Comment.js`
- `Working/Module_9/implementation_logs/feature schemas implementation log.md`

## Files Modified

- None.

## What Was Built

Defined the four CodeBloggs Mongoose models — the backend data layer that every later
API feature reads from and writes to. Each file is one schema + one `mongoose.model`
export. snake_case field names match the API contract exactly so controllers map
request/response bodies 1:1.

- **User** (`users`): `first_name`, `last_name` (both required); `email` (required,
  **unique**); `password` (required, plain String here); `birthday` (Date, required);
  `location`, `occupation` (optional); `status` (Boolean, default `true`); `auth_level`
  (String, default `"basic"`).
- **Session** (`sessions`): `session_id` (String, required); `session_date` (Date, default
  `Date.now`); `user` (ObjectId ref `User`, required). No `expiry` field by design.
- **Post** (`posts`): `content` (required); `user_id` (ObjectId ref `User`, required);
  `likes` (Number, default `0`); `time_stamp` (String, required); `comments` (array of
  ObjectId refs to `Comment`).
- **Comment** (`comments`): `content` (required); `post_id` (ObjectId ref `Post`, required);
  `user_id` (ObjectId ref `User`, required); `likes` (Number, default `0`); `time_stamp`
  (String, required).

Relationship fields all use `mongoose.Schema.Types.ObjectId` with the correct `ref`.

## Key Decisions

- Used ESM `import`/`export default` (project is `"type": "module"`) rather than the
  `require` shown in the spec's examples, to match the existing server code.
- `time_stamp` stored as a String on Post and Comment, per the spec's team-decided override
  (diverges from a Date type; recorded in `Working/Issues.md`).
- `Post.comments[]` and `Comment.post_id` link Post↔Comment from both sides; keeping them in
  sync is a controller responsibility (Issue 8), not enforced in the schema.
- Left `_id`/`__v` as Mongoose defaults (no schema options changed).

## Intentionally Not Implemented (owned by later features)

- bcrypt password hashing / pre-save hooks (User API feature).
- Session-id generation and expiry checking (Session API feature).
- Email-format / password-strength validation regex (relevant API features).
- Any controllers, routes, endpoints, or seed data.

## Deviations from Specification

- **Folder name:** models live in `server/schemas/` instead of the `server/models/` path
  named in `schemas.feature.md` and the `ai-spec.md` repo structure. Team preference; matches
  the `feature/schemas` branch name. Field tables and behavior are otherwise unchanged.
- ESM exports instead of CommonJS `require` (the project uses ESM); the spec's examples showed
  `require`.
- The spec's intentional divergences from `ai-spec.md`/wireframe/CSV (e.g. `status` Boolean,
  Session fields, String `time_stamp`) were implemented as specified and are tracked in
  `Working/Issues.md` (Issues 3–8).

## Known Issues

- None specific to the models. Post↔Comment two-sided linking requires controller
  discipline to avoid drift (tracked as Issue 8).

## Verification Results

- `node --check` passed for all four model files (no syntax/import errors).
- Loaded all four models via Node ESM and confirmed:
  - Models register without errors.
  - Collections resolve to `users`, `sessions`, `posts`, `comments`.
  - Schema paths match the spec tables exactly (plus default `_id`/`__v`).
- A live create-one-of-each against a running MongoDB was not performed in this session
  (requires a reachable `MONGO_URI`); collection creation on first write is standard
  Mongoose behavior and the models are import-verified.
- The CLIENT folder was not touched, per instructions.
