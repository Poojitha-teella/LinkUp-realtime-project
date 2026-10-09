import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import joinRequestsRouter from "./routes/joinRequests.js"; 
import { createWebSocketServer } from "./ws.js";

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));

app.use("/api/auth", rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "pulseroom-server", pid: process.pid });
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api", joinRequestsRouter); 

createWebSocketServer(server);

const port = Number(process.env.PORT || 4000);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(port, () => {
      console.log(`PulseRoom server running on http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
