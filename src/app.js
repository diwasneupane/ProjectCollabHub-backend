import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import groupRouter from "./routes/group.routes.js";
import messageRouter from "./routes/message.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import { Notification } from "./models/notification.model.js";

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
  console.log(`New connection: ${socket.id}`);

  socket.on("joinRoom", (room) => {
    try {
      console.log(`Socket ${socket.id} joining room: ${room}`);
      socket.join(room);
    } catch (error) {
      console.error(`Error joining room: ${error.message}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  socket.on("error", (err) => {
    console.error(`Socket error: ${err.message}`);
  });
});

app.post("/api/v1/message/send-message", (req, res) => {
  const io = req.app.get("io");
  const { room, message } = req.body;
  io.to(room).emit("newMessage", message);
  console.log(`Message sent to room ${room}: ${message}`);
  res.send("Message sent successfully");
});

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on("flagRaised", async ({ groupId, newAtRiskStatus }) => {
    try {
      const notification = new Notification({
        type: "flag",
        message: `Group ${groupId} is now ${newAtRiskStatus ? "at risk" : "not at risk"}`,
      });

      await notification.save();

      io.emit("newNotification", notification);
    } catch (error) {
      console.error("Error handling flagRaised event:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
export { app, server };
