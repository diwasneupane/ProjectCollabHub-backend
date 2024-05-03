import { Message } from "../models/message.model.js";
import Group from "../models/groups.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const isAuthorizedForGroup = (group, userId, userRole) => {
  const instructorId = group.instructor?.toString();
  const studentIds = group.students.map((student) => student.toString());

  return (
    studentIds.includes(userId) ||
    instructorId === userId ||
    userRole === "admin"
  );
};

import fs from "fs/promises";
import path from "path";

const currentModuleUrl = new URL(import.meta.url);
const currentModuleDir = path.dirname(currentModuleUrl.pathname);

const sendMessageToGroup = asyncHandler(async (req, res) => {
  const { groupId, content } = req.body;
  const { _id: senderId, role: userRole } = req.user;

  let attachment = null;
  if (req.file) {
    attachment = {
      filename: req.file.filename,
      path: req.file.path,
      mimeType: req.file.mimetype,
    };
  }

  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (!isAuthorizedForGroup(group, senderId, userRole)) {
    throw new ApiError(403, "Not authorized to send messages to this group");
  }

  const messageData = {
    group: groupId,
    sender: senderId,
    createdAt: new Date(),
  };

  if (content) {
    messageData.content = content;
  }

  if (attachment) {
    const attachmentFileName = `${Date.now()}_${attachment.filename}`;
    const attachmentFilePath = path.join(
      currentModuleDir,
      "uploads",
      attachmentFileName
    );

    await fs.rename(attachment.path, attachmentFilePath);

    attachment.path = attachmentFilePath;
    messageData.attachment = attachment;
  }

  const message = await Message.create(messageData);

  group.messages.push(message._id);
  await group.save();

  const io = req.app.get("io");
  if (io) {
    io.to(groupId).emit("newGroupMessage", { message });
  }

  res.status(201).json({ success: true, message });
});

const sendMessageToUser = asyncHandler(async (req, res) => {
  const { userId, content } = req.body;
  const { _id: senderId } = req.user;

  console.log("Request file:", req.file); // Debugging information

  const attachment = req.file
    ? {
        filename: req.file.filename,
        path: req.file.path,
        mimeType: req.file.mimetype,
      }
    : null;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Create message and emit via socket.io
  const message = await Message.create({
    content,
    user: userId,
    sender: senderId,
    attachment,
    createdAt: new Date(),
  });

  const io = req.app.get("io");
  if (io) {
    io.emit("newUserMessage", { message });
  }

  res.status(201).json({ success: true, message });
});

const wordSearchInGroups = asyncHandler(async (req, res) => {
  const { searchTerm } = req.query;
  const { groupIds } = req.body;

  if (!groupIds || groupIds.length === 0) {
    throw new ApiError(400, "Group IDs are required");
  }
  if (!searchTerm || searchTerm.trim() === "") {
    throw new ApiError(400, "Search term is required");
  }

  const messages = await Message.find({
    group: { $in: groupIds },
    content: new RegExp(searchTerm, "i"),
  });

  res.status(200).json({ success: true, messages });
});

const getGroupMessages = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { _id: userId, role: userRole } = req.user;

  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (!isAuthorizedForGroup(group, userId, userRole)) {
    throw new ApiError(403, "Not authorized to view messages from this group");
  }

  const messages = await Message.find({ group: groupId }).populate(
    "user",
    "username"
  ); // Assuming there's a field 'user' in the Message schema referencing the user who sent the message

  res.status(200).json({ success: true, group, messages });
});
// Get user-specific messages
const getUserMessages = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;

  const messages = await Message.find({ user: userId });

  if (!messages || messages.length === 0) {
    throw new ApiError(404, "No messages found for this user");
  }

  res.status(200).json({ success: true, messages });
});

export {
  sendMessageToGroup,
  sendMessageToUser,
  wordSearchInGroups,
  getGroupMessages,
  getUserMessages,
};
