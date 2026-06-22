import mongoose from "mongoose";

const profilePicSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  data: { type: Buffer, required: true },
  mime_type: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now },
});

const ProfilePic = mongoose.model("ProfilePic", profilePicSchema);

export default ProfilePic;
