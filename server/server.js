import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import connectDB from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoute.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// Allowed frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Socket.IO setup
export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || origin === FRONTEND_URL) callback(null, true);
      else callback(new Error("CORS not allowed"));
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store online users
export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("user connected", userId);
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("user disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware
app.use(express.json({ limit: "4mb" }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === FRONTEND_URL) callback(null, true);
    else callback(new Error("CORS not allowed"));
  },
  credentials: true
}));

// Routes
app.use("/api/status", (req, res) => res.send("server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to DB
await connectDB();

// Start server (local only)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log("server running on PORT:", PORT));
}

// Export server for Vercel
export default server;
