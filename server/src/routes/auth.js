import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../auth.js";
import crypto from "crypto";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
      return res.status(400).json({ message: "Username must be 3–24 letters, numbers or _." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({message: "Please enter a valid email address."});
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const exists = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (exists) {
      if (exists.username === username) {
        return res.status(409).json({ message: "Username already exists." });
      }

      return res.status(409).json({ message: "Email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username,email, passwordHash });
    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, avatarColor: user.avatarColor }
    });
  } catch {
    res.status(500).json({ message: "Could not create account." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");

   

    const user = await User.findOne({ username });
  
    const passwordMatches = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;



    if (!user || !passwordMatches) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, username: user.username, avatarColor: user.avatarColor }
    });
  } catch (err) {
      console.error("REGISTER ERROR:", err);
      res.status(500).json({ message: "Could not create account." });
  }
    });

    router.post("/forgot-password", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    const user = await User.findOne({ email });

    // Always return the same response so people cannot discover
    // whether an email is registered.
    if (!user) {
      return res.json({
        message: "If that email is registered, a password reset link has been created."
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires =
      new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    console.log(
      `PASSWORD RESET LINK: http://localhost:5173/reset-password/${resetToken}`
    );

    res.json({
      message: "If that email is registered, a password reset link has been created."
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Could not process password reset request."
    });
  }
});


router.post("/reset-password", async (req, res) => {
  try {
    const token = String(req.body.token || "");
    const newPassword = String(req.body.password || "");


    if (!token) {
      return res.status(400).json({
        message: "Reset token is required."
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters."
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired."
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);

   

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({
      message: "Password reset successfully."
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Could not reset password."
    });
  }
});

export default router;
