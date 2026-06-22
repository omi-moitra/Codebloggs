# Feature Seed Script Implementation Log

## Files Created

- `server/seed.js`
- `Working/Module_9/implementation_logs/feature seed-script implementation log.md`

## Files Modified

- `server/package.json` — added `"seed": "node seed.js"` script.

## What Was Built

A standalone seeder (`seed.js`) that clears and re-populates the `users` and `posts` MongoDB
collections from two JSON export files:

- `server/codebloggs_seed_users_no_indian_gods.json` — 61 users (pre-hashed passwords, ObjectId `_id`s)
- `server/codebloggs_seed_posts_no_indian_gods.json` — 72 posts linked to those users

Run with:

```
npm run seed
```

from the `server/` directory.

## Key Decisions

- **Raw collection API instead of Mongoose models** — The post JSON export uses a different
  shape from the current `Post` Mongoose schema (`user` instead of `user_id`, adds `title` and
  `category`, uses `createdAt`/`updatedAt` timestamps instead of `time_stamp`). Using
  `mongoose.connection.db.collection()` bypasses schema validation and inserts the documents
  exactly as exported, preserving all fields and references without requiring schema changes
  or data transformation.

- **Extended JSON conversion via `fromExtendedJson()`** — MongoDB export files use Extended
  JSON format (`{ $oid: "..." }`, `{ $date: "..." }`). A small recursive helper converts these
  to proper `ObjectId` and `Date` instances before insertion so Mongo stores typed values, not
  raw strings. This also keeps the seeder self-contained with no external EJSON library.

- **`deleteMany({})` before insert** — The script wipes both collections before inserting so
  it is safe to re-run without producing duplicates or `_id` conflicts. The order is clear
  first, then insert (not drop-and-recreate) to avoid losing indexes.

- **`dotenv/config` import** — MONGO_URI lives in `.env`. Importing `dotenv/config` at the
  top ensures environment variables are populated before `connectToDatabase()` reads them,
  consistent with how the rest of the server loads config.

- **Reuses `connectToDatabase()`** — The existing `db/connection.js` helper owns the
  connection lifecycle and error handling. The seeder calls it rather than inlining its own
  `mongoose.connect()` to stay DRY and get the same failure behaviour (logs + `process.exit(1)`)
  if the URI is missing or the connection fails.

## Verification Steps

1. `npm run seed` exits 0 and prints:
   ```
   ✅ Connected to MongoDB
   🗑️  Cleared users
   🗑️  Cleared posts
   ✅ Inserted 61 users
   ✅ Inserted 72 posts
   ✅ Done
   ```
2. Re-running `npm run seed` a second time produces the same counts with no duplicate-key errors.
3. In MongoDB Atlas (or Compass), `users` collection contains 61 documents with `ObjectId` `_id`
   fields and `Date` `birthday` values (not strings).
4. `posts` collection contains 72 documents; each `user` field is an `ObjectId` matching a
   `_id` in the `users` collection.
