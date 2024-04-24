import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// app.use(authenticateToken);

import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import groupRouter from "./routes/group.routes.js";
import messageRouter from "./routes/message.routes.js";
import notificationRouter from "./routes/notification.routes.js";
app.use("/api/v1/users", userRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/group", groupRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/notification", notificationRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("joinRoom", (room) => {
    try {
      console.log(`Joining room: ${room}`);
      socket.join(room);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  });

  socket.on("disconnect", () => {
    try {
      console.log("User disconnected:", socket.id);
    } catch (error) {
      console.error("Error on disconnect:", error);
    }
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

export { app, server };
