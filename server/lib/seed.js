import bcrypt from "bcrypt";
import mongoose from "mongoose";

export class SeedConfigError extends Error {}

export function getSeedConfig(env) {
  if (!["development", "test"].includes(env.NODE_ENV)) {
    throw new SeedConfigError("Seeding requires NODE_ENV=development or NODE_ENV=test; production is blocked.");
  }
  const dbName = env.SEED_DB_NAME;
  if (
    !dbName ||
    dbName !== dbName.trim() ||
    dbName.length > 63 ||
    !/^codebloggs_test(?:_[a-z0-9]+)*$/.test(dbName)
  ) {
    throw new SeedConfigError("Set SEED_DB_NAME to codebloggs_test or codebloggs_test_<suffix> (lowercase letters and digits).");
  }
  const uri = env.SEED_MONGO_URI;
  if (!uri || uri !== uri.trim() || !/^mongodb(?:\+srv)?:\/\/\S+$/.test(uri)) {
    throw new SeedConfigError("Set SEED_MONGO_URI to a dedicated test MongoDB connection string. MONGO_URI is never used for seeding.");
  }
  const password = env.SEED_TEST_PASSWORD;
  if (
    !password ||
    !password.trim() ||
    [...password].length < 12 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throw new SeedConfigError("Set a local SEED_TEST_PASSWORD of at least 12 characters and at most 72 UTF-8 bytes.");
  }
  return { uri, dbName, password };
}

function fromExtendedJson(value) {
  if (Array.isArray(value)) return value.map(fromExtendedJson);
  if (value !== null && typeof value === "object") {
    if ("$oid" in value) return new mongoose.Types.ObjectId(value.$oid);
    if ("$date" in value) return new Date(value.$date);
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, fromExtendedJson(entry)])
    );
  }
  return value;
}

export async function prepareSeedUsers(users, password, hashPassword = bcrypt.hash) {
  const prepared = [];
  for (const { _id, __v, password: discardedPassword, ...user } of users) {
    prepared.push({
      ...fromExtendedJson(user),
      // A numeric cost generates a new salt for EACH user, even with one test password.
      password: await hashPassword(password, 10),
      auth_level: "basic",
      status: false,
    });
  }
  return prepared;
}

async function connectSeedDatabase(uri, options) {
  // A separate connection avoids reusing the application's database connection.
  const connection = mongoose.createConnection();
  try {
    await connection.openUri(uri, options);
    return connection;
  } catch (error) {
    await connection.close();
    throw error;
  }
}

export async function seedTestDatabase({
  env = process.env,
  users,
  posts,
  connect = connectSeedDatabase,
  hashPassword = bcrypt.hash,
}) {
  const config = getSeedConfig(env);
  if (!Array.isArray(users) || users.length === 0 || !Array.isArray(posts)) {
    throw new Error("Expected fictional user and post fixture arrays.");
  }
  // Prepare credentials and data before connecting; hashing failures cause no writes.
  const preparedUsers = await prepareSeedUsers(users, config.password, hashPassword);
  const preparedPosts = posts
    .filter((post) => post.category !== "Indian gods")
    .map(({ _id, __v, title, user, user_id, createdAt, updatedAt, ...post }) =>
      fromExtendedJson(post)
    );
  const connection = await connect(config.uri, {
    dbName: config.dbName,
    serverSelectionTimeoutMS: 5000,
  });
  try {
    const db = connection.db;
    if (db.databaseName !== config.dbName) {
      throw new Error("Connected database does not match the selected test database.");
    }
    const inserted = await db.collection("users").insertMany(preparedUsers);
    const userIds = Object.values(inserted.insertedIds);
    const postsToInsert = preparedPosts.map((post) => ({
      ...post,
      user_id: userIds[Math.floor(Math.random() * userIds.length)],
    }));
    if (postsToInsert.length) {
      await db.collection("posts").insertMany(postsToInsert);
    }
    return { users: userIds.length, posts: postsToInsert.length };
  } finally {
    await connection.close();
  }
}
