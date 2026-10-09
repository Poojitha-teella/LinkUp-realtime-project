import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 24 },
  email: {type: String,required: true,unique: true,trim: true,lowercase: true},
  passwordHash: { type: String, required: true },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  avatarColor: { type: String, default: "#7c3aed" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
