// user.routes.js — User resource router (mounted at /user in server.js).
//
// Maps each HTTP method + path to its controller handler. No business logic
// lives here — that belongs to the controller.
//
// ⚠️ Base path is SINGULAR /user per wireframe-analysis.md (Working/Issues.md,
// Issue 1). The CSV's plural /users wording is superseded.

import express from "express";

import {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { registerValidators } from "../validators/user.validators.js";

const router = express.Router();

// POST /user        → create a new user (registration)
router.post("/", registerValidators, createUser);

// GET  /user        → get all users
router.get("/", getAllUsers);

// GET  /user/:id    → get a single user by MongoDB _id
router.get("/:id", getUserById);

// PATCH /user/:id   → update allowed user fields by MongoDB _id
router.patch("/:id", updateUser);

// DELETE /user/:id  → delete a user and related content
router.delete("/:id", deleteUser);

export default router;
