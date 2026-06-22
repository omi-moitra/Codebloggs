// db/connection.js — MongoDB connection for CodeBloggs using Mongoose.
//
// This module owns the single database connection that the rest of the backend
// reuses. Later features (Schemas, Session API, User API, etc.) import the
// Mongoose models which all run through this one connection — we never open a
// second connection per request.
//
// Configuration comes ONLY from environment variables (loaded by dotenv in
// server.js). There are no hard-coded URIs here. ⚠️ If MONGO_URI is missing the
// app cannot run, so we fail loudly rather than silently connecting to nowhere.

import mongoose from "mongoose";

// connectToDatabase() establishes the Mongoose connection and reports the
// result. It is exported so server.js can await it before the app starts
// listening — there is no point accepting requests we cannot serve.
async function connectToDatabase() {
  // Read inside the function so dotenv.config() in server.js has already run
  // by the time this is called. ES module imports are hoisted, so a
  // module-level const would be evaluated before dotenv populates process.env.
  const MONGO_URI = process.env.MONGO_URI;

  // ⚠️ Guard: without a URI there is nothing to connect to. Fail fast with a
  // clear message instead of a confusing low-level driver error later.
  if (!MONGO_URI) {
    console.error(
      "❌ MONGO_URI is not set. Copy .env.example to .env and fill it in."
    );
    process.exit(1);
  }

  try {
    // mongoose.connect returns a promise that resolves once connected.
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    // Connection-error handling: log the failure and exit. A backend that
    // cannot reach its database should not pretend to be healthy.
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

// Export both the helper and the underlying connection object so later features
// can reuse them (e.g. for connection-state checks).
export { connectToDatabase };
export default mongoose.connection;
