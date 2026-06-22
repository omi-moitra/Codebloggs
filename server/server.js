// server.js — CodeBloggs Express backend bootstrap.
//
// This is the foundation/infrastructure feature: it stands up a runnable Express
// server, connects to MongoDB, applies the global middleware every endpoint will
// depend on, and mounts the (currently empty) resource routers. No business
// logic lives here — later features add handlers inside the routers.

// dotenv must run before anything reads process.env (including db/connection.js).
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Database connection helper. Imported after dotenv.config() so MONGO_URI exists.
import { connectToDatabase } from "./db/connection.js";

// Resource routers. Each is mounted below at its agreed base path. They are
// empty for now (this feature only wires them up); later features add routes.
import sessionRoutes from "./routes/session.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import replyRoutes from "./routes/reply.routes.js";
import profilePicRoutes from "./routes/profilePic.routes.js";
import presenceRoutes from "./routes/presence.routes.js";

// Read configuration from the environment — never hard-code these values.
const PORT = process.env.PORT || 5050;
const DEFAULT_LOCAL_CLIENT_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];
const parseOrigins = (value) =>
  value
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) || [];
const configuredClientOrigins = process.env.CLIENT_ORIGINS
  ? parseOrigins(process.env.CLIENT_ORIGINS)
  : parseOrigins(process.env.CLIENT_ORIGIN);
const developmentClientOrigins = [
  ...DEFAULT_LOCAL_CLIENT_ORIGINS,
  ...configuredClientOrigins,
];
const allowedClientOrigins = new Set(
  process.env.NODE_ENV === "production"
    ? configuredClientOrigins
    : developmentClientOrigins
);

const app = express();

// ---------------------------------------------------------------------------
// Global middleware (order matters)
// ---------------------------------------------------------------------------

// Parse incoming JSON request bodies into req.body.
app.use(express.json());

// CORS configured for cookie-based authentication.
// ⚠️ credentials: true + an EXPLICIT origin are both required. Auth is
// cookie-based, and browsers refuse to send credentials to a wildcard
// origin ("*"). Using origin: "*" here would silently break session login
// later — this is the most common beginner mistake on this project.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedClientOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

// Parse the Cookie header into req.cookies. Required because sessions are read
// from the session_token cookie (never from localStorage).
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Route registration — mount each router at its agreed base path.
// Base paths come from wireframe-analysis.md (the signed-off API contract).
// ---------------------------------------------------------------------------
app.use("/session", sessionRoutes); // login / logout / validate
app.use("/user", userRoutes); // create / get-by-id / get-all
app.use("/posts", postRoutes); // create / update / get-all
app.use("/comments", commentRoutes); // create / update / get-all
app.use("/replies", replyRoutes);   // create / update / get-by-post
app.use("/profile-pic", profilePicRoutes); // upload / get by user id
app.use("/presence", presenceRoutes); // who is online right now

// ---------------------------------------------------------------------------
// Startup: connect to MongoDB first, then start listening. We await the DB so
// the server only accepts requests once it can actually serve them.
// ---------------------------------------------------------------------------
async function startServer() {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
}

startServer();
