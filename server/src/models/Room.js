import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 40 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isPrivate: { type: Boolean, default: false },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Room", roomSchema);
