# AI Feature Specification - Server Configuration

This feature specification must be used with the Global AI Spec for CodeBloggs.
In this repository, use the current project specs at:

1. `ai/Module_10/ai-spec.md`
2. `ai/Module_9/ai-spec.md`

## Feature Goal

Configure the CodeBloggs backend so it can start reliably, read environment
variables, connect to MongoDB, expose Express routes, support cookie-based
sessions, and protect sensitive local files from source control.

## Scope

### In Scope

- Backend environment variable loading with `dotenv`.
- Required `.env` values for MongoDB, server port, and client origin.
- MongoDB connection through Mongoose.
- Express app setup and global middleware.
- Route mounting for the backend API.
- `.gitignore` rules for secrets, dependencies, logs, build output, and local
  artifacts.
- Backend package dependencies and npm scripts.

### Out of Scope

- Frontend build configuration.
- Deployment-specific hosting configuration.
- Creating a new database provider.
- Replacing Express, Mongoose, or cookie-based sessions.
- Storing secrets in source-controlled documentation.
- Adding production TLS or reverse proxy settings.

## Requirements Breakdown

### `.env` Configured

- `server/.env` must exist locally.
- Required keys:
  - `MONGO_URI`
  - `PORT`
  - `CLIENT_ORIGIN`
- `MONGO_URI` must point to the intended MongoDB database.
- `PORT` controls the Express listen port; `server/server.js` falls back to
  `5050` if it is absent.
- `CLIENT_ORIGIN` is used by CORS to allow browser requests with cookies.
- Secret values must not be committed or copied into feature docs.

### `.gitignore` Rules

- Root `.gitignore` must ignore:
  - `.env`
  - `.env.*`
  - `server/.env`
  - `node_modules/`
  - logs
  - coverage output
  - build output such as `dist`
  - OS/editor artifacts such as `.DS_Store`
- `.env.example` is allowed by the ignore rules so a safe template can be
  committed if needed.

### Required Libraries Installed

Backend dependencies are managed in `server/package.json`.

- Runtime dependencies:
  - `bcrypt`
  - `cookie-parser`
  - `cors`
  - `dotenv`
  - `express`
  - `express-validator`
  - `mongoose`
  - `multer`
- Development dependencies:
  - `nodemon`
- Main scripts:
  - `npm start` runs `node server.js`.
  - `npm run dev` runs `nodemon server.js`.
  - `npm run seed` runs `node seed.js`.

### Server and DB Connection Working

- `server/server.js` must call `dotenv.config()` before reading environment
  variables or connecting to MongoDB.
- `server/db/connection.js` must read `process.env.MONGO_URI` inside
  `connectToDatabase()`.
- If `MONGO_URI` is missing, the backend must fail fast with a clear error.
- If MongoDB connection fails, the backend must log the error and exit.
- The Express server should listen only after `connectToDatabase()` resolves.
- The backend must mount all route files at their agreed base paths.

## User Flow

This is an infrastructure feature, so the primary actor is the developer or
runtime process.

1. Developer creates `server/.env` with `MONGO_URI`, `PORT`, and
   `CLIENT_ORIGIN`.
2. Developer installs backend packages with `npm install` in `server`.
3. Developer starts the backend with `npm start` or `npm run dev`.
4. `server/server.js` loads `.env`, creates the Express app, applies middleware,
   mounts routes, connects to MongoDB, and then listens on the configured port.
5. Client requests from the configured origin can call the API with cookies.

## Interfaces Involved

### Backend Configuration Files

- `server/server.js`
- `server/db/connection.js`
- `server/lib/session.config.js`
- `server/package.json`
- `server/package-lock.json`
- `server/.env`
- `.gitignore`

### Middleware

- `express.json()` parses JSON request bodies.
- `cors({ origin, credentials: true })` allows configured browser origins to
  send cookie-authenticated requests.
- `cookieParser()` parses session cookies for session routes and protected
  middleware.

### Mounted API Routes

- `/session` -> `server/routes/session.routes.js`
- `/user` -> `server/routes/user.routes.js`
- `/posts` -> `server/routes/post.routes.js`
- `/comments` -> `server/routes/comment.routes.js`
- `/replies` -> `server/routes/reply.routes.js`
- `/profile-pic` -> `server/routes/profilePic.routes.js`
- `/presence` -> `server/routes/presence.routes.js`

### Session Configuration

- Cookie name: `session_token`.
- Cookie options: `httpOnly: true`, `sameSite: "lax"`.
- Session TTL: 24 hours.
- Expiration is derived from Session `session_date`; it is not stored as a
  separate field.

## Data, Validations, and Expected Behavior

### Environment Data

| Key | Required | Used By | Expected Behavior |
| --- | --- | --- | --- |
| `MONGO_URI` | yes | `server/db/connection.js` | Backend connects to MongoDB before listening. |
| `PORT` | recommended | `server/server.js` | Backend listens on this port, or `5050` fallback. |
| `CLIENT_ORIGIN` | recommended | `server/server.js` | Origin is allowed by CORS for credentialed requests. |

### CORS Behavior

- In development, the backend allows:
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
  - values from `CLIENT_ORIGIN` or `CLIENT_ORIGINS`
- In production, the backend allows only configured client origins.
- Requests without an origin are allowed so tools like Postman can work.
- Cookie authentication requires `credentials: true` and an explicit allowed
  origin.

### Database Behavior

- Mongoose owns a single shared MongoDB connection.
- The server exits if no MongoDB URI is configured.
- The server exits if Mongoose cannot connect.
- Controllers and schemas reuse the shared Mongoose connection.

### Package Behavior

- Backend dependencies must be present in `server/node_modules` after install.
- The lockfile must stay in sync with `server/package.json`.
- The server is ESM-based with `"type": "module"`.

## Acceptance Criteria

- [ ] `server/.env` exists locally and includes `MONGO_URI`, `PORT`, and
      `CLIENT_ORIGIN` keys.
- [ ] `.gitignore` excludes `.env`, `.env.*`, `server/.env`, `node_modules/`,
      logs, coverage output, build output, and `.DS_Store`.
- [ ] `server/package.json` includes required backend runtime libraries and
      `nodemon` as a development dependency.
- [ ] `npm install` in `server` installs dependencies successfully.
- [ ] `npm start` in `server` runs `node server.js`.
- [ ] `dotenv.config()` runs before MongoDB connection setup.
- [ ] Missing `MONGO_URI` produces a clear failure instead of a silent startup.
- [ ] Successful startup logs that MongoDB connected and that the server is
      listening on the configured port.
- [ ] Express middleware is registered in the correct order:
      `express.json()`, CORS, then `cookieParser()`.
- [ ] API routes are mounted at `/session`, `/user`, `/posts`, `/comments`,
      `/replies`, `/profile-pic`, and `/presence`.
- [ ] Cookie-based session requests work from the configured client origin.
