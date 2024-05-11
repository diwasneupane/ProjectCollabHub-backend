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
import path from "path";
import { fileURLToPath } from "url";
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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessage", (message) => {
    io.emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.post("/api/v1/message/send-message", async (req, res) => {
  const io = req.app.get("io");
  const { groupId, message } = req.body;

  try {
    const savedMessage = await saveMessageToDatabase(message);

    io.to(groupId).emit("newMessage", savedMessage);
    console.log(`Message sent to group ${groupId}: ${message}`);
    res.send("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send("Error sending message");
  }
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
