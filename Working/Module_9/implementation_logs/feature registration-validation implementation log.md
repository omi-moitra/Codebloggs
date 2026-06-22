# Feature Registration Validation (Extra Mile) Implementation Log

## Files Created

- `server/validators/user.validators.js`
- `Working/Module_9/implementation_logs/feature registration-validation implementation log.md`

## Files Modified

- `server/schemas/User.js` — added `trim`, `maxlength`, and `lowercase` to string fields.
- `server/routes/user.routes.js` — added `registerValidators` middleware to `POST /user`.
- `server/controllers/user.controller.js` — imported `validationResult`, replaced the manual
  presence check with the express-validator result check, added `ValidationError` handler in
  catch.
- `server/package.json` — added `express-validator` dependency.

## What Was Built

Backend enforcement of two Extra Mile registration requirements:

- **Max character lengths** — `first_name` and `last_name` capped at 50 characters;
  `location` and `occupation` capped at 100 characters. Enforced at two layers:
  1. Route layer (`express-validator` middleware) — returns `400` with a descriptive message
     before any DB query runs.
  2. Schema layer (Mongoose `maxlength`) — acts as a last-resort DB-level safeguard if the
     route middleware is ever bypassed.

- **Email validation** — `express-validator`'s `isEmail()` (backed by `validator.js`, RFC
  5321/5322 compliant) runs on every `POST /user` request. Invalid format returns `400`
  `"Invalid email format"` before the duplicate-email DB check.

All validation errors follow the existing `{ status, data, message }` response contract. Only
the first error is returned per request (consistent with how the frontend `Alert` component
displays a single message string).

## Key Decisions

- **`express-validator` over a hand-rolled regex** — `isEmail()` handles RFC edge cases
  (subdomains, `+` tags, quoted strings) that a custom regex typically misses. It also lets all
  field rules live in one readable chain (`user.validators.js`) rather than scattered `if`
  checks in the controller.

- **`express-validator` over `validator.js` alone** — `express-validator` handles both length
  enforcement and email validation in a single middleware array, keeping validation at the
  request boundary rather than split across the schema and controller.

- **Two-layer enforcement (route + schema)** — The route layer provides fast, user-facing
  feedback. The schema layer (`maxlength`, `trim`, `lowercase`) provides data integrity
  independent of which route (or future script/seeder) writes to the collection.

- **`location` and `occupation` marked `.optional()`** in the validators — these fields are
  optional in the schema and the registration flow. The length cap only applies when a value
  is provided.

- **Removed the blanket presence check** (`if (!first_name || !last_name || ...)`) from the
  controller — `express-validator` covers those fields. `password` and `birthday` are not
  validated by express-validator (out of scope for this task) so a minimal presence guard
  for those two was retained.

- **Frontend validation is the partner's scope** — `maxLength` attributes on form inputs,
  client-side email regex, and the location autocomplete component are handled separately on
  the client. The backend changes here are the server-side enforcement layer only.

## Intentionally Not Implemented (out of scope)

- Password strength validation (length, complexity).
- Birthday / age validation.
- Client-side validation, `maxLength` props, or location autocomplete (frontend scope).
- Validation on `GET /user` or `GET /user/:id` routes (read-only, no body).

## Verification Steps

1. `POST /user` with `email: "notanemail"` → expect `400` `"Invalid email format"`.
2. `POST /user` with `first_name` > 50 characters → expect `400` length message.
3. `POST /user` with `location` > 100 characters → expect `400` length message.
4. `POST /user` with all valid data → expect `201` registration success.
5. `POST /user` with missing `email` field → expect `400` `"Invalid email format"` (isEmail
   fails on empty/undefined).
