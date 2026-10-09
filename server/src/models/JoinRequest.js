import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

joinRequestSchema.index(
  { room: 1, user: 1 },
  { unique: true }
);

export default mongoose.model(
  "JoinRequest",
  joinRequestSchema
);