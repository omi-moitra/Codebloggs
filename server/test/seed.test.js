import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";
import bcrypt from "bcrypt";
import { getSeedConfig, prepareSeedUsers, seedTestDatabase } from "../lib/seed.js";
import { users as alternateUsers } from "../seed.data.js";

const fixtureUsers = JSON.parse(
  readFileSync(new URL("../codebloggs_seed_users_no_indian_gods.json", import.meta.url), "utf8")
);
const fixturePosts = JSON.parse(
  readFileSync(new URL("../codebloggs_seed_posts_no_indian_gods.json", import.meta.url), "utf8")
);
const makeEnv = (overrides = {}) => ({
  NODE_ENV: "test",
  SEED_MONGO_URI: "mongodb://test-host.invalid/application_database",
  SEED_DB_NAME: "codebloggs_test_local",
  SEED_TEST_PASSWORD: randomUUID(),
  ...overrides,
});

for (const [name, overrides] of [
  ["production mode", { NODE_ENV: "production" }],
  ["unset environment", { NODE_ENV: undefined }],
  ["unknown environment", { NODE_ENV: "staging" }],
  ["missing test database", { SEED_DB_NAME: undefined }],
  ["application database", { SEED_DB_NAME: "codebloggs" }],
  ["system database", { SEED_DB_NAME: "admin" }],
  ["misleading test suffix", { SEED_DB_NAME: "codebloggs_testing" }],
  ["database with a path", { SEED_DB_NAME: "codebloggs_test/production" }],
  ["database with a trailing newline", { SEED_DB_NAME: "codebloggs_test\n" }],
  ["oversized database name", { SEED_DB_NAME: `codebloggs_test_${"a".repeat(64)}` }],
  ["missing separate URI", { SEED_MONGO_URI: undefined, MONGO_URI: "mongodb://application.invalid/production" }],
  ["unsupported URI", { SEED_MONGO_URI: "https://test-host.invalid" }],
  ["URI with a trailing newline", { SEED_MONGO_URI: "mongodb://test-host.invalid\n" }],
  ["missing password", { SEED_TEST_PASSWORD: undefined }],
  ["short password", { SEED_TEST_PASSWORD: randomUUID().slice(0, 8) }],
  ["short Unicode password", { SEED_TEST_PASSWORD: "🔐".repeat(6) }],
  ["blank password", { SEED_TEST_PASSWORD: " ".repeat(12) }],
  ["password exceeding bcrypt's byte limit", { SEED_TEST_PASSWORD: "🔐".repeat(19) }],
]) {
  test(`rejects ${name} before hashing or connecting`, async () => {
    let connections = 0;
    let hashes = 0;
    await assert.rejects(seedTestDatabase({
      env: makeEnv(overrides),
      users: fixtureUsers.slice(0, 1),
      posts: [],
      connect: async () => { connections++; },
      hashPassword: async () => { hashes++; },
    }));
    assert.equal(connections, 0);
    assert.equal(hashes, 0);
  });
}

test("accepts explicit development/test targets and bcrypt's byte boundary", () => {
  for (const NODE_ENV of ["development", "test"]) {
    for (const SEED_DB_NAME of ["codebloggs_test", "codebloggs_test_local_2"]) {
      const env = makeEnv({ NODE_ENV, SEED_DB_NAME, SEED_TEST_PASSWORD: "🔐".repeat(18) });
      assert.equal(getSeedConfig(env).dbName, SEED_DB_NAME);
    }
  }
});

test("all bundled users are credential-free fictional fixtures", () => {
  assert.equal(fixtureUsers.length, 61);
  assert.equal(alternateUsers.length, 10);
  for (const user of [...fixtureUsers, ...alternateUsers]) {
    assert.equal(Object.hasOwn(user, "password"), false);
    assert.equal(Object.hasOwn(user, "passwordHash"), false);
  }
});

test("generates distinct bcrypt hashes that authenticate the local password", async () => {
  const password = randomUUID();
  const raw = fixtureUsers.slice(0, 2).map((user) => ({
    ...user, password: randomUUID(), auth_level: "admin", status: true,
  }));
  const original = structuredClone(raw);
  const prepared = await prepareSeedUsers(raw, password);
  assert.notEqual(prepared[0].password, prepared[1].password);
  for (const user of prepared) {
    assert.equal(await bcrypt.compare(password, user.password), true);
    assert.equal(await bcrypt.compare(randomUUID(), user.password), false);
    assert.equal(bcrypt.getRounds(user.password), 10);
    assert.equal(user.auth_level, "basic");
    assert.equal(user.status, false);
    assert.ok(user.birthday instanceof Date);
    assert.equal(Object.hasOwn(user, "_id"), false);
    assert.equal(Object.hasOwn(user, "__v"), false);
  }
  assert.deepEqual(raw, original);
});

function fakeConnection({ databaseName = "codebloggs_test_local", failCollection } = {}) {
  const calls = [];
  let closed = false;
  return {
    calls,
    get closed() { return closed; },
    db: {
      databaseName,
      collection(name) {
        return {
          async insertMany(rows) {
            calls.push({ name, rows });
            if (name === failCollection) throw new Error("Simulated insert failure");
            return { insertedIds: Object.fromEntries(rows.map((row, i) => [i, `new-user-${i}`])) };
          },
        };
      },
    },
    async close() { closed = true; },
  };
}

test("uses only the separate URI, explicitly selects the test DB, and links new users", async () => {
  const env = makeEnv({ MONGO_URI: "mongodb://application.invalid/production" });
  const connection = fakeConnection();
  const result = await seedTestDatabase({
    env,
    users: fixtureUsers.slice(0, 2),
    posts: fixturePosts.slice(0, 2),
    connect: async (uri, options) => {
      assert.equal(uri, env.SEED_MONGO_URI);
      assert.equal(options.dbName, env.SEED_DB_NAME);
      return connection;
    },
  });
  assert.deepEqual(result, { users: 2, posts: 2 });
  assert.deepEqual(connection.calls.map((call) => call.name), ["users", "posts"]);
  for (const user of connection.calls[0].rows) {
    assert.equal(await bcrypt.compare(env.SEED_TEST_PASSWORD, user.password), true);
  }
  for (const post of connection.calls[1].rows) {
    assert.ok(["new-user-0", "new-user-1"].includes(post.user_id));
    for (const field of ["_id", "__v", "user", "title", "createdAt", "updatedAt"]) {
      assert.equal(Object.hasOwn(post, field), false);
    }
  }
  assert.equal(connection.closed, true);
});

test("refuses a mismatched connected database without writes and closes it", async () => {
  const connection = fakeConnection({ databaseName: "production" });
  await assert.rejects(seedTestDatabase({
    env: makeEnv(), users: fixtureUsers.slice(0, 1), posts: [],
    connect: async () => connection,
    hashPassword: async () => "test-double-hash",
  }), /does not match/);
  assert.deepEqual(connection.calls, []);
  assert.equal(connection.closed, true);
});

test("hashing failures cannot contact a database", async () => {
  let connections = 0;
  await assert.rejects(seedTestDatabase({
    env: makeEnv(), users: fixtureUsers.slice(0, 1), posts: [],
    connect: async () => { connections++; },
    hashPassword: async () => { throw new Error("Simulated hashing failure"); },
  }), /hashing failure/);
  assert.equal(connections, 0);
});

for (const failCollection of ["users", "posts"]) {
  test(`closes the connection after ${failCollection} insertion fails`, async () => {
    const connection = fakeConnection({ failCollection });
    await assert.rejects(seedTestDatabase({
      env: makeEnv(), users: fixtureUsers.slice(0, 1), posts: fixturePosts.slice(0, 1),
      connect: async () => connection,
      hashPassword: async () => "test-double-hash",
    }), /insert failure/);
    assert.equal(connection.closed, true);
    if (failCollection === "users") assert.equal(connection.calls.length, 1);
  });
}

test("skips an empty post insert", async () => {
  const connection = fakeConnection();
  await seedTestDatabase({
    env: makeEnv(), users: fixtureUsers.slice(0, 1), posts: [],
    connect: async () => connection,
    hashPassword: async () => "test-double-hash",
  });
  assert.deepEqual(connection.calls.map((call) => call.name), ["users"]);
  assert.equal(connection.closed, true);
});

test("the CLI exits in production without logging local credentials", () => {
  const password = randomUUID();
  const uri = `mongodb://tester:${randomUUID()}@test-host.invalid`;
  const child = spawnSync(process.execPath, ["seed.js"], {
    cwd: new URL("../", import.meta.url),
    env: { ...process.env, ...makeEnv({ NODE_ENV: "production", SEED_MONGO_URI: uri, SEED_TEST_PASSWORD: password }) },
    encoding: "utf8",
    timeout: 5000,
  });
  assert.equal(child.status, 1);
  assert.match(child.stderr, /production is blocked/);
  assert.equal((child.stdout + child.stderr).includes(password), false);
  assert.equal((child.stdout + child.stderr).includes(uri), false);
});
