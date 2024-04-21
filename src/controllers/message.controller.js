import { Message } from "../models/message.model.js";
import Group from "../models/groups.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// Send message to a group
const sendMessageToGroup = asyncHandler(async (req, res) => {
  console.log("SendMessageToGroup triggered");
  console.log("Received body:", req.body); // Verify body data
  console.log("Received file:", req.file); // Check if Multer processed the file

  const { groupId, content } = req.body;
  const { _id: senderId, role: userRole } = req.user;

  const attachment = req.file
    ? {
        filename: req.file.filename,
        path: req.file.path,
        mimeType: req.file.mimetype,
      }
    : null;
  console.log("Attachment data:", attachment);

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
  const { userId, content, senderId } = req.body;
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

  // Emit the event for user-specific messages
  const io = req.app.get("io");
  io.emit("newUserMessage", { message });

  res.status(201).json({ success: true, message });
});

const wordSearchInGroups = asyncHandler(async (req, res) => {
  const { searchTerm } = req.query;
  const { groupIds } = req.body;

  // Validate inputs
  if (!groupIds || groupIds.length === 0) {
    throw new ApiError(400, "Group IDs are required");
  }
  if (!searchTerm || searchTerm.trim() === "") {
    throw new ApiError(400, "Search term is required");
  }

  // Fetch groups to check their existence and permissions
  const groups = await Group.find({
    _id: { $in: groupIds },
  });

  if (groups.length !== groupIds.length) {
    throw new ApiError(404, "Some groups not found");
  }

  // Get all messages from specified groups that match the search term
  const messages = await Message.find({
    group: { $in: groupIds },
    content: new RegExp(searchTerm, "i"), // Case-insensitive search
  });

  res.status(200).json({ success: true, messages });
});
export { sendMessageToGroup, sendMessageToUser, wordSearchInGroups };
