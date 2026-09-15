// Development/test fixtures only. See README.md for the required local settings.
import "dotenv/config";
import { readFileSync } from "node:fs";
import { getSeedConfig, SeedConfigError, seedTestDatabase } from "./lib/seed.js";

async function main() {
  // Reject unsafe configuration before loading fixtures or contacting MongoDB.
  getSeedConfig(process.env);
  const readFixture = (name) =>
    JSON.parse(readFileSync(new URL(name, import.meta.url), "utf8"));
  const result = await seedTestDatabase({
    users: readFixture("./codebloggs_seed_users_no_indian_gods.json"),
    posts: readFixture("./codebloggs_seed_posts_no_indian_gods.json"),
  });
  console.log(`Inserted ${result.users} fictional users and ${result.posts} test posts.`);
}

main().catch((error) => {
  // Driver errors can contain connection details. Never print the URI or password.
  console.error(
    error instanceof SeedConfigError
      ? error.message
      : "Test seeding failed. Check the test database, permissions, and existing fixture accounts. No rollback is performed; a failed run may have inserted some fixtures."
  );
  process.exitCode = 1;
});
