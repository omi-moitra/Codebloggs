import express from "express";
import multer from "multer";

import {
  uploadProfilePic,
  getProfilePic,
} from "../controllers/profilePic.controller.js";
import { requireSession } from "../middleware/requireSession.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG images are accepted."));
    }
  },
});

// POST /profile-pic      → upload/replace profile picture (session required)
router.post("/", requireSession, upload.single("image"), uploadProfilePic);

// GET  /profile-pic/:userId → get a user's profile picture (public)
router.get("/:userId", getProfilePic);

router.use((err, _req, res, next) => {
  if (!err) {
    return next();
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Profile pictures must be 2 MB or smaller."
        : "Unable to upload profile picture.";

    return res.status(400).json({
      status: "error",
      data: {},
      message,
    });
  }

  if (err.message === "Only JPEG and PNG images are accepted.") {
    return res.status(400).json({
      status: "error",
      data: {},
      message: err.message,
    });
  }

  return next(err);
});

export default router;
