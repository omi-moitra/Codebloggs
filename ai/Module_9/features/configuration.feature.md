# 🤖 AI_FEATURE_Backend-Configuration

This document describes **one feature of the CodeBloggs project**: the backend
configuration / bootstrap.

It must be read together with:

1. The global AI specification — [`ai/ai-spec.md`](../ai-spec.md)
2. This feature specification

This feature is **infrastructure**, not a user-facing feature. It produces the runnable
Express server, the MongoDB connection, the global middleware, and the empty route wiring
that every later backend feature (Session API, User API, Post API, Comment API) plugs into.

---

## Feature Identity

- **Feature Name:** Backend Configuration (Server Bootstrap)
- **Related Area:** Backend

---

## Feature Goal

Stand up a runnable Express backend that:

- Connects to MongoDB on startup and reports connection success/failure.
- Applies the global middleware every endpoint depends on (JSON body parsing, CORS with
  credentials, cookie parsing).
- Reads its configuration (Mongo URI, port, allowed client origin) from environment
  variables, never from hard-coded values.
- Exposes four empty-but-mounted resource routers so that subsequent features only have to
  add handlers, not wiring.

When this feature is done, `npm run dev` starts a server that connects to the database and
responds, even though no business endpoints exist yet.

---

## Feature Scope

### In Scope (Included)

- Backend dependency list in `server/package.json`:
  `express`, `mongoose`, `cors`, `bcrypt`, `cookie-parser`, `dotenv`, and `nodemon` (dev).
- `server/db/connection.js` — MongoDB connection using `MONGO_URI` from `.env`, exported
  for reuse, with connection-error handling.
- `server/server.js` — Express app: imports the DB connection, registers global middleware
  (JSON parsing, CORS with credentials, cookie-parser), reads `PORT` from `.env`, and starts
  listening.
- Four route files under `server/routes/` — `session.routes.js`, `user.routes.js`,
  `post.routes.js`, `comment.routes.js` — each exporting an Express `Router`.
- Registration of all four routers in `server.js` at their agreed base paths.
- A `.env.example` documenting the required environment variables (no real secrets).

### Out of Scope (Excluded)

- Any business logic: login, registration, post creation, comments, likes, validation.
  Routers are created and mounted but contain **no endpoint handlers** in this feature.
- Mongoose schemas / models — owned by the **Schemas** feature.
- Controllers — owned by each resource's API feature.
- Authentication / session-validation middleware — owned by the **Session API** feature.
- Any frontend code, and the Postman collection.

---

## Sub-Requirements (Feature Breakdown)

- **Dependencies** — Add the required packages to `server/package.json`, with `nodemon` as
  a dev dependency, plus `start` and `dev` scripts.
- **Environment config** — All runtime values (`MONGO_URI`, `PORT`, `CLIENT_ORIGIN`) come
  from `.env` via `dotenv`. Provide a committed `.env.example`; never commit a real `.env`.
- **Database connection** — `db/connection.js` connects with `mongoose.connect(MONGO_URI)`,
  logs success, catches and logs connection errors, and exports the connection so it can be
  imported by `server.js`.
- **Server + middleware** — `server.js` creates the Express app and applies, in order:
  `express.json()` (JSON body parsing), `cors({ origin: CLIENT_ORIGIN, credentials: true })`
  (cookies must cross origins for session auth), and `cookie-parser()`.
- **Route files** — One router file per resource under `routes/`. Each file imports
  `express`, creates a `Router`, and exports it. No handlers yet.
- **Route registration** — `server.js` mounts all four routers with `app.use()` at the
  agreed base paths, then starts listening on `PORT`.

---

## User Flow / Logic (High Level)

This feature has no end-user flow; the "actor" is the server process at startup.

1. Process starts (`npm run dev`).
2. `dotenv` loads `.env` into `process.env`.
3. `db/connection.js` calls `mongoose.connect(MONGO_URI)`; success or failure is logged.
4. `server.js` builds the Express app and applies global middleware.
5. `server.js` mounts the four resource routers at their base paths.
6. The app listens on `PORT`; the server is ready for later features to add handlers.

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

None. This feature is backend-only.

### Backend / API

No business endpoints are implemented here. This feature only **mounts** the routers that
later features fill in. Agreed base paths (from `wireframe-analysis.md`, which is the
signed-off API contract):

- `/session` → `session.routes.js` — login / logout / validate (Session API feature)
- `/user`    → `user.routes.js`    — create / get-by-id / get-all (User API feature)
- `/posts`   → `post.routes.js`    — create / update / get-all (Post API feature)
- `/comments`→ `comment.routes.js` — create / update / get-all (Comment API feature)

```js
// ⚠️ Naming discrepancy to reconcile with the team:
//   - wireframe-analysis.md (signed-off contract) uses SINGULAR  /user
//   - module9-jira-tasks.csv uses PLURAL            /users
//   This spec follows wireframe-analysis.md (/user). If the team prefers /users,
//   update the wireframe analysis, this file, and the Postman collection together.
// ⚠️ Folder discrepancy: ai-spec.md repo structure uses /server/db; the CSV task text
//   says database/. This spec follows ai-spec.md (/server/db).
```

---

## Data Used or Modified

No collections are read or written by this feature. It only **opens** the MongoDB
connection that later features use. Collections (Users, Sessions, Posts, Comments) are
created on first use by the Schemas feature.

Environment variables consumed:

- `MONGO_URI` — MongoDB connection string
- `PORT` — port the Express server listens on
- `CLIENT_ORIGIN` — the React app origin allowed by CORS (e.g. `http://localhost:3000`)

---

## Tech Constraints (Feature-Level)

- Use the approved backend stack only (Node, Express, Mongoose, bcrypt, cors, nodemon).
- CORS **must** set `credentials: true` and an explicit origin — auth is cookie-based, so a
  wildcard `*` origin will break the session cookie. ⚠️ Do not use `origin: "*"`.
- `cookie-parser` is required because sessions are read from cookies (never `localStorage`).
- All config via `dotenv`; no hard-coded URIs, ports, or origins.
- Follow the repo structure in `ai-spec.md`. Do not create files outside it.
- Add clear inline comments and mark every known limitation with `// ⚠️`.

---

## Acceptance Criteria

- [ ] `server/package.json` lists all required dependencies and a `dev` script using nodemon.
- [ ] `.env.example` documents `MONGO_URI`, `PORT`, and `CLIENT_ORIGIN`; no real `.env` is committed.
- [ ] `db/connection.js` connects using `MONGO_URI`, logs success, handles connection errors, and is exported.
- [ ] `server.js` applies `express.json()`, `cors` (explicit origin + `credentials: true`), and `cookie-parser`.
- [ ] All four routers exist under `routes/` and each exports an Express `Router`.
- [ ] All four routers are mounted in `server.js` at `/session`, `/user`, `/posts`, `/comments`.
- [ ] `npm run dev` starts the server, connects to MongoDB, and listens on `PORT` with no errors.
- [ ] No business logic / handlers were added (those belong to the resource API features).
- [ ] No console or lint errors; ready to merge into `dev` from `feature/backend-config`.

---

## Notes for the AI

- This is the **foundation** feature — keep it minimal. Create wiring, not behavior.
- Do **not** add endpoint handlers, controllers, or schemas here; later features own those.
- Reuse the exact base paths above so later features only add routes, never re-wire.
- Explain the CORS `credentials: true` decision in a comment — it is the most common
  beginner mistake that breaks cookie-based auth later.
- Per `ai-spec.md`, create an implementation log under
  `Working/Module_9/implementation_logs/` summarizing files created, decisions, and the
  naming/folder discrepancies flagged above.
