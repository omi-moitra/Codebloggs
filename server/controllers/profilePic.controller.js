import ProfilePic from "../schemas/ProfilePic.js";

// POST /profile-pic — Upload or replace the current user's profile picture.
// req.file is populated by multer (memoryStorage). user_id comes from the
// session middleware — never from the request body.
export async function uploadProfilePic(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        data: {},
        message: "No image file provided.",
      });
    }

    await ProfilePic.findOneAndUpdate(
      { user_id: req.user._id },
      {
        data: req.file.buffer,
        mime_type: req.file.mimetype,
        uploaded_at: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      status: "ok",
      data: {},
      message: "Profile picture uploaded successfully.",
    });
  } catch (err) {
    console.error("Upload profile pic error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error.",
    });
  }
}

// GET /profile-pic/:userId — Retrieve a user's profile picture as raw binary.
// Public endpoint — no session required so <img src="..."> tags work without
// credentials. Returns 404 JSON if the user has no profile picture.
export async function getProfilePic(req, res) {
  try {
    const doc = await ProfilePic.findOne({ user_id: req.params.userId });

    if (!doc) {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "Profile picture not found.",
      });
    }

    res.set("Content-Type", doc.mime_type);
    res.set("Cache-Control", "no-cache, max-age=0");
    return res.send(doc.data);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({
        status: "error",
        data: {},
        message: "Profile picture not found.",
      });
    }

    console.error("Get profile pic error:", err);
    return res.status(500).json({
      status: "error",
      data: {},
      message: "Internal server error.",
    });
  }
}
