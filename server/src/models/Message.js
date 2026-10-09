import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  text: { type: String, required: true, trim: true, maxlength: 1000 },
  reactions: {
    type: Map,
    of: [{ type: mongoose.Schema.Types.ObjectId }]
  },
  createdAt: { type: Date, default: Date.now, index: true }
});

export default mongoose.model("Message", messageSchema);
