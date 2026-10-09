import { Router } from "express";
import Room from "../models/Room.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { verifyToken } from "../auth.js";

const router = Router();

function protect(req, res, next) {
  try {
    const raw = req.headers.authorization?.replace("Bearer ", "");
    req.user = verifyToken(raw);
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized." });
  }
}

router.use(protect);

router.get("/", async (_req, res) => {
  const rooms = await Room.find({ isPrivate: false })
    .sort({ createdAt: -1 })
    .select("name isPrivate members owner")
    .populate("members", "username avatarColor")
    .populate("owner", "username avatarColor");
  res.json(rooms);
});
router.get("/:roomId", async (req, res) => {
  const room = await Room.findById(req.params.roomId)
    .populate("members", "username avatarColor")
    .populate("owner", "username avatarColor");

  if (!room) {
    return res.status(404).json({
      message: "Room not found."
    });
  }

  res.json(room);
});

router.post("/", async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name || name.length > 40) return res.status(400).json({ message: "Invalid room name." });

  try {
    const room = await Room.create({
      name,
      owner: req.user.id,
      members: [req.user.id]
    });
    res.status(201).json(room);
  } catch {
    res.status(409).json({ message: "Room name already exists." });
  }
});

router.post("/:roomId/join", async (req, res) => {
  const room = await Room.findByIdAndUpdate(
    req.params.roomId,
    { $addToSet: { members: req.user.id } },
    { new: true }
  );
  if (!room) return res.status(404).json({ message: "Room not found." });
  res.json(room);
});

router.get("/:roomId/messages", async (req, res) => {
  const room = await Room.findById(req.params.roomId);
  if (!room) return res.status(404).json({ message: "Room not found." });

  const messages = await Message.find({ roomId: room._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json(messages.reverse());
});

// RENAME ROOM
router.patch("/:roomId", async (req, res) => {
  const name = String(req.body.name || "").trim();

  if (!name || name.length > 40) {
    return res.status(400).json({
      message: "Invalid room name."
    });
  }

  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found."
      });
    }

    // Only the channel owner can rename it
    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the channel owner can rename it."
      });
    }

    room.name = name;
    await room.save();

    res.json(room);
  } catch {
    res.status(409).json({
      message: "Room name already exists."
    });
  }
});

export default router;
