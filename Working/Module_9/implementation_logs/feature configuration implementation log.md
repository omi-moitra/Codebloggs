# Feature Configuration (Backend Bootstrap) Implementation Log

## Files Created

- `server/routes/session.routes.js`
- `server/routes/user.routes.js`
- `server/routes/post.routes.js`
- `server/routes/comment.routes.js`
- `server/.env.example`
- `Working/Module_9/implementation_logs/feature configuration implementation log.md`

## Files Modified

- `server/server.js`
- `server/db/connection.js`
- `server/package.json`
- `.gitignore`

## Files Removed

- `server/routes/record.js` — leftover MERN-tutorial CRUD route, not part of the spec's four routers.
- `server/seed.js` — tutorial seed script depending on the removed native `mongodb` driver.
- `server/config.env.example` — replaced by `server/.env.example` (dotenv + `MONGO_URI`/`PORT`/`CLIENT_ORIGIN`).

## What Was Built

- Converted the server from the native `mongodb` tutorial scaffold to the Mongoose-based
  bootstrap the feature spec requires.
- `server/package.json`: added `express`, `mongoose`, `cors`, `bcrypt`, `cookie-parser`,
  `dotenv` dependencies and `nodemon` as a devDependency; added `start` (node) and `dev`
  (nodemon) scripts; removed the native `mongodb` driver.
- `server/db/connection.js`: connects with `mongoose.connect(MONGO_URI)` using the env var,
  logs success, catches/logs connection errors, fails fast if `MONGO_URI` is missing, and
  exports both `connectToDatabase()` and the Mongoose connection.
- `server/server.js`: loads `dotenv` first, builds the Express app, applies global middleware
  in order — `express.json()`, `cors({ origin: CLIENT_ORIGIN, credentials: true })`,
  `cookie-parser()` — mounts the four routers, then connects to MongoDB before listening on
  `PORT`. All config (`PORT`, `CLIENT_ORIGIN`, `MONGO_URI`) read from the environment.
- Four empty-but-mounted resource routers, each exporting an Express `Router` with no handlers.
- `server/.env.example` documenting `MONGO_URI`, `PORT`, and `CLIENT_ORIGIN` (no secrets).
- `.gitignore`: added `.env` so a real env file is never committed.

## Route Base Paths (signed-off contract)

- `/session`  → `session.routes.js`
- `/user`     → `user.routes.js`
- `/posts`    → `post.routes.js`
- `/comments` → `comment.routes.js`

## Key Decisions

- Followed `ai-spec.md` repo structure (`/server/db`) over the CSV's `database/`.
- Used SINGULAR `/user` per `wireframe-analysis.md` (signed-off contract) rather than the
  plural `/users` in `module9-jira-tasks.csv`. Flagged in `user.routes.js` for the team.
- Awaited the DB connection before `app.listen()` so the server only accepts requests once
  it can serve them.
- CORS uses an explicit origin with `credentials: true` (never `*`) because authentication
  is cookie-based; documented inline as the most common beginner mistake.
- Removed the tutorial leftovers (`record.js`, `seed.js`, `config.env.example`) because they
  depended on the now-removed native `mongodb` driver and are not part of this feature.

## Intentionally Not Implemented (owned by later features)

- Endpoint handlers / controllers (resource API features)
- Mongoose schemas / models (Schemas feature)
- Authentication / session-validation middleware (Session API feature)
- Any business logic: login, registration, posts, comments, likes, validation.

## Deviations from Specification

- Spec lists files to create under `server/`; the existing scaffold already had `server.js`,
  `db/connection.js`, and `package.json`, so those were modified rather than created, and the
  unrelated tutorial files were removed. No functional deviation from the acceptance criteria.

## Known Issues

- `npm install` reported 2 high-severity advisories in transitive dependencies; not addressed
  here to avoid unrelated version bumps in this infrastructure feature.

## Verification Results

- `npm install` in `server/` completed (added required packages).
- `node --check` passed for `server.js`, `db/connection.js`, and all four route files
  (no syntax/import errors).
- A live `npm run dev` boot against a running MongoDB instance was not performed in this
  session (no local MongoDB available / boot test was not run). Wiring verified by static
  checks; a real boot requires a populated `.env` with a reachable `MONGO_URI`.
- The CLIENT folder was not touched at any point, per instructions.
