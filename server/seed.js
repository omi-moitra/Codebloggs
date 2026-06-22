// seed.js — seeds users then posts from the JSON export files.
// Reads inserted user _ids after the user insert and randomly assigns them to
// posts. Strips fields that do not match the Post schema (title, category,
// createdAt, updatedAt, __v). Does not delete existing data.
// Run: npm run seed

import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import { connectToDatabase } from "./db/connection.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function fromExtendedJson(value) {
  if (Array.isArray(value)) return value.map(fromExtendedJson);
  if (value !== null && typeof value === "object") {
    if ("$oid" in value) return new mongoose.Types.ObjectId(value.$oid);
    if ("$date" in value) return new Date(value.$date);
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, fromExtendedJson(v)])
    );
  }
  return value;
}

async function seed() {
  await connectToDatabase();
  const db = mongoose.connection.db;

  // --- Users ---
  const rawUsers = fromExtendedJson(
    JSON.parse(
      readFileSync(
        join(__dirname, "codebloggs_seed_users_no_indian_gods.json"),
        "utf-8"
      )
    )
  );

  // Strip _id and __v so MongoDB generates fresh ids and there are no
  // conflicts if the seed is run against a db that already has these users.
  const usersToInsert = rawUsers.map(({ _id, __v, ...rest }) => rest);

  const userResult = await db.collection("users").insertMany(usersToInsert);
  const userIds = Object.values(userResult.insertedIds);
  console.log(`✅ Inserted ${userIds.length} users`);

  // --- Posts ---
  const rawPosts = fromExtendedJson(
    JSON.parse(
      readFileSync(
        join(__dirname, "codebloggs_seed_posts_no_indian_gods.json"),
        "utf-8"
      )
    )
  ).filter((p) => p.category !== "Indian gods");

  // Strip schema-incompatible fields, then randomly assign a live user _id.
  // Field is user_id to match the Post schema — not `user`.
  const postsToInsert = rawPosts.map(
    ({ _id, __v, title, user, createdAt, updatedAt, ...rest }) => ({
      ...rest,
      user_id: userIds[Math.floor(Math.random() * userIds.length)],
    })
  );

  const postResult = await db.collection("posts").insertMany(postsToInsert);
  console.log(`✅ Inserted ${Object.keys(postResult.insertedIds).length} posts`);

  await mongoose.disconnect();
  console.log("✅ Done");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
