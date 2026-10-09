import express from "express";
import JoinRequest from "../models/JoinRequest.js";
import Room from "../models/Room.js";
import { verifyToken } from "../auth.js";

const router = express.Router();

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

router.post("/rooms/:roomId/join-request", async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        message: "Channel not found."
      });
    }

    const alreadyMember = room.members.some(
      id => id.toString() === req.user.id
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "You are already a member of this channel."
      });
    }

    const existing = await JoinRequest.findOne({
      room: room._id,
      user: req.user.id
    });

    if (existing?.status === "pending") {
      return res.status(400).json({
        message: "Join request already sent."
      });
    }

    if (existing) {
      existing.status = "pending";
      existing.createdAt = new Date();
      await existing.save();

      return res.json(existing);
    }

    const request = await JoinRequest.create({
      room: room._id,
      user: req.user.id
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({
      message: "Could not send join request."
    });
  }
});

router.get("/join-requests", async (req, res) => {
   
  try {
    const rooms = await Room.find({
      owner: req.user.id
    }).select("_id");

    const roomIds = rooms.map(room => room._id);

    const requests = await JoinRequest.find({
      room: { $in: roomIds },
      status: "pending"
    })
      .populate("user", "username avatarColor")
      .populate("room", "name")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    
     console.error("LOAD JOIN REQUESTS ERROR:", error);
    res.status(500).json({
      message: "Could not load join requests."
    });
  }
});

router.post("/join-requests/:requestId/approve", async (req, res) => {
  try {
    const joinRequest = await JoinRequest.findById(
      req.params.requestId
    ).populate("room");

    if (!joinRequest) {
      return res.status(404).json({
        message: "Request not found."
      });
    }

    if (
      joinRequest.room.owner.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Only the channel owner can approve requests."
      });
    }

    if (joinRequest.status !== "pending") {
      return res.status(400).json({
        message: "Request is no longer pending."
      });
    }

    const room = await Room.findById(joinRequest.room._id);

    if (
      !room.members.some(
        id => id.toString() === joinRequest.user.toString()
      )
    ) {
      room.members.push(joinRequest.user);
      await room.save();
    }

    joinRequest.status = "approved";
    await joinRequest.save();

    res.json({
      message: "Member approved."
    });
  } catch {
    res.status(500).json({
      message: "Could not approve request."
    });
  }
});

router.post("/join-requests/:requestId/reject", async (req, res) => {
  try {
    const joinRequest = await JoinRequest.findById(
      req.params.requestId
    ).populate("room");

    if (!joinRequest) {
      return res.status(404).json({
        message: "Request not found."
      });
    }

    if (
      joinRequest.room.owner.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Only the channel owner can reject requests."
      });
    }

    joinRequest.status = "rejected";
    await joinRequest.save();

    res.json({
      message: "Request rejected."
    });
  } catch {
    res.status(500).json({
      message: "Could not reject request."
    });
  }
});

export default router;