import { Message } from "../models/message.model.js";
import Group from "../models/groups.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// Send message to a group
const sendMessageToGroup = asyncHandler(async (req, res) => {
  const { groupId, content } = req.body;
  const { _id: senderId, role: userRole } = req.user;

  const attachment = req.file
    ? {
        filename: req.file.filename,
        path: req.file.path,
        mimeType: req.file.mimetype,
      }
    : null;

  const group = await Group.findById(groupId);

  if (!group) {
    return res.status(404).json({ success: false, message: "Group not found" });
  }

  const instructorId = group.instructor?.toString();
  const studentIds = group.students.map((student) => student.toString());

  const isAuthorized =
    studentIds.includes(senderId) ||
    instructorId === senderId ||
    userRole === "admin";

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to send messages to this group",
    });
  }

  const message = await Message.create({
    content,
    group: groupId,
    sender: senderId,
    attachment,
    createdAt: new Date(),
  });

  group.messages.push(message._id);
  await group.save();

  // Emit the event to clients connected to this group
  const io = req.app.get("io");
  if (io) {
    io.to(groupId).emit("newGroupMessage", { message });
  }

  res.status(201).json({ success: true, message });
});

// Send message to a user
const sendMessageToUser = asyncHandler(async (req, res) => {
  const { userId, content } = req.body;
  const senderId = req.user._id;
  const attachment = req.file
    ? {
        filename: req.file.filename,
        path: req.file.path,
        mimeType: req.file.mimetype,
      }
    : null;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const message = await Message.create({
    content,
    user: userId,
    sender: senderId,
    attachment,
    createdAt: new Date(),
  });

  const io = req.app.get("io");
  io.emit("newUserMessage", { message });

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

  const groups = await Group.find({
    _id: { $in: groupIds },
  });

  if (groups.length !== groupIds.length) {
    throw new ApiError(404, "Some groups not found");
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

  const instructorId = group.instructor?.toString();
  const studentIds = group.students.map((student) => student.toString());

  const isAuthorized =
    studentIds.includes(userId) ||
    instructorId === userId ||
    userRole === "admin";

  if (!isAuthorized) {
    throw new ApiError(403, "Not authorized to view messages from this group");
  }

  const messages = await Message.find({ group: groupId });

  res.status(200).json({ success: true, messages });
});
const getUserMessages = asyncHandler(async (req, res) => {
  const { _id: currentUserId } = req.user;

  // Fetch messages where the current user is the recipient
  const messages = await Message.find({ user: currentUserId });

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
