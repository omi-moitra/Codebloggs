// schemas/User.js — User Mongoose model (collection: "users").
//
// Defines the SHAPE of a user account only. No behavior lives here:
// ⚠️ Password hashing is owned by the User API feature (bcrypt happens in the
// controller), NOT in this schema. Do not add a pre-save hash hook here.
//
// Field names are snake_case to match the API contract exactly so controllers
// can map request/response bodies 1:1.

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true, trim: true, maxlength: 50 },
  last_name: { type: String, required: true, trim: true, maxlength: 50 },
  birthday: { type: Date, required: true },

  // Email is the unique account identifier used to log in.
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },

  // ⚠️ Stored as a bcrypt hash (hashed in the User API, not here) and must
  // never be returned in API responses.
  password: { type: String, required: true },

  // Online status. true = currently logged in, false = logged out.
  // Toggled by the Session API: set true on login, false on logout. Defaults
  // to false — a newly registered user is not active until they log in.
  status: { type: Boolean, default: false },

  // Optional profile fields from the Registration wireframe.
  location: { type: String, trim: true, maxlength: 100 },
  occupation: { type: String, trim: true, maxlength: 100 },

  // Authorization level. ⚠️ "basic" | "admin"; never settable by the client
  // (that rule is enforced in the User API, not the schema).
  auth_level: { type: String, default: "basic" },
});

// One schema + one model export per file.
const User = mongoose.model("User", userSchema);

export default User;
