// message.controller.js

import { Message } from "../models/message.model.js";
import Group from "../models/groups.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { log } from "console";
import { Notification } from "../models/notification.model.js";

const currentModuleUrl = new URL(import.meta.url);
const currentModuleDir = path.dirname(currentModuleUrl.pathname);

const isAuthorizedForGroup = (group, userId, userRole) => {
  const instructorId = group.instructor?.toString();
  const studentIds = group.students.map((student) => student.toString());

  return (
    studentIds.includes(userId) ||
    instructorId === userId ||
    userRole === "admin"
  );
};

const sendMessageToGroup = asyncHandler(async (req, res) => {
  const { groupId, content } = req.body;
  const { _id: senderId, role: userRole } = req.user;

  try {
    let attachment = null;
    if (req.file) {
      attachment = {
        filename: req.file.filename,
        path: req.file.path,
        mimeType: req.file.mimetype,
      };

      const attachmentFileName = `${Date.now()}_${attachment.filename}`;
      const currentModuleDir = path.dirname(fileURLToPath(import.meta.url));
      const uploadsDirectory = path.resolve(
        currentModuleDir,
        "../../public/uploads"
      );
      const attachmentFilePath = path.join(
        uploadsDirectory,
        attachmentFileName
      );

      await fs.promises.rename(attachment.path, attachmentFilePath);
      attachment.path = attachmentFilePath;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!isAuthorizedForGroup(group, senderId, userRole)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send messages to this group",
      });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res
        .status(404)
        .json({ success: false, message: "Sender not found" });
    }

    let messageData = {
      group: groupId,
      sender: senderId,
      createdAt: new Date(),
    };

    if (content) {
      messageData.content = content;
    }

    if (attachment) {
      messageData.attachment = attachment;
    } else {
      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Either content or file attachment is required",
        });
      }
    }

    const message = await Message.create(messageData);

    group.messages.push(message._id);
    await group.save();

    // Fetch students and instructor details of the group
    const students = await User.find({ _id: { $in: group.students } });
    const instructor = await User.findById(group.instructor);

    const notification = new Notification({
      type: "group_message",
      message: `${sender.username} sent a new message to the group ${group.name}`,
      groupId: groupId,
      sender: senderId,
      relatedMessage: message._id,
      groupDetails: {
        name: group.name,
        students: students.map((student) => ({
          _id: student._id,
          username: student.username,
        })),
        instructor: {
          _id: instructor._id,
          username: instructor.username,
        },
      },
    });

    await notification.save();

    const io = req.app.get("io");
    if (io) {
      io.to(groupId).emit("newGroupMessage", { message });
    }

    res
      .status(201)
      .json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

const sendMessageToUser = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.params.userId;
    const senderId = req.user._id;

    console.log("Sender ID:", senderId);
    console.log(userId);

    let attachment = null;
    if (req.file) {
      attachment = {
        filename: req.file.originalname,
        path: req.file.path,
        mimeType: req.file.mimetype,
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log("User found:", user);

    const message = await Message.create({
      content,
      user: userId,
      sender: senderId,
      attachment,
      createdAt: new Date(),
    });

    console.log("Message created:", message);

    const io = req.app.get("io");
    if (io) {
      io.emit("newUserMessage", { message });
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const getGroupMessages = asyncHandler(async (req, res) => {
  try {
    const { groupId } = req.params;
    const { _id: userId, role: userRole } = req.user;

    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!isAuthorizedForGroup(group, userId, userRole)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view messages from this group",
      });
    }

    const messages = await Message.find({ group: groupId }).populate(
      "user",
      "username"
    );

    res.status(200).json({ success: true, group, messages });
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
const getUserMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const messages = await Message.find({ user: userId }).populate(
    "sender",
    "username"
  );

  res.status(200).json({ success: true, messages });
});

export {
  sendMessageToGroup,
  sendMessageToUser,
  getGroupMessages,
  getUserMessages,
};
