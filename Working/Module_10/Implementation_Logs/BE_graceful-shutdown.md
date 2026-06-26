# BE Implementation Log — Graceful Shutdown

**Feature:** Backend Graceful Shutdown  
**Role:** Backend  
**Date:** 2026-06-25  
**Spec:** Module 10 backend shutdown requirement

---

## Purpose

Add a safe backend shutdown path so the Express server stops accepting new requests, lets active requests finish, closes the existing MongoDB/Mongoose connection, and exits only after cleanup completes.

---

## Files Modified

| File | Change |
|---|---|
| `server/server.js` | Stored the HTTP server returned by `app.listen()` |
| `server/server.js` | Added one-time shutdown handling for `SIGINT` and `SIGTERM` |
| `server/server.js` | Added HTTP server close and MongoDB connection close cleanup steps |

---

## Implementation Summary

- Reused the existing Mongoose connection exported from `server/db/connection.js`.
- Added a stored `server` reference for the value returned by `app.listen()`.
- Added an `isShuttingDown` guard so cleanup cannot run more than once.
- Added `SIGINT` and `SIGTERM` process handlers.
- During shutdown:
  - logs the received shutdown signal
  - calls `server.close()` to stop accepting new HTTP requests and wait for active requests
  - closes the existing MongoDB connection when it is open
  - exits with status code `0` after successful cleanup
  - exits with status code `1` if cleanup fails

---

## Testing Performed

- Ran syntax check:
  - `node --check server/server.js`
- Started the backend with `PORT=5051 npm start`.
- Confirmed MongoDB connected successfully.
- Confirmed the server listened successfully on port `5051`.
- Confirmed existing endpoints still returned `200 OK`:
  - `GET /posts`
  - `GET /user`
- Sent `SIGINT` with `Ctrl+C` and confirmed shutdown logs:
  - `Server received shutdown signal: SIGINT`
  - `Stopping HTTP server...`
  - `Closing MongoDB connection...`
  - `Shutdown complete.`
- Sent `SIGTERM` and confirmed shutdown logs:
  - `Server received shutdown signal: SIGTERM`
  - `Stopping HTTP server...`
  - `Closing MongoDB connection...`
  - `Shutdown complete.`
- Confirmed both shutdown paths exited with status code `0`.

---

## Risks Considered

- Avoided creating a second MongoDB connection by reusing the existing exported Mongoose connection.
- Avoided restructuring the backend startup flow because `server/server.js` already owns Express setup, MongoDB connection, and `app.listen()`.
- Added a shutdown guard to avoid duplicate cleanup if multiple signals arrive.
- Used `server.close()` so active requests can finish before MongoDB closes.
- Left existing routes, controllers, schemas, middleware, and frontend files unchanged.

---

## Result

Graceful shutdown is implemented for the backend. The application still starts normally, existing endpoints continue functioning, and both `SIGINT` and `SIGTERM` now cleanly stop the HTTP server, close MongoDB, and exit after cleanup.
