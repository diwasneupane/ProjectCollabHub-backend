import express from "express";
import {
  sendMessageToGroup,
  sendMessageToUser,
  getGroupMessages,
  getUserMessages,
} from "../controllers/message.controller.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/auth.middlewares.js";
import multerMiddleware from "../middlewares/multer.middleware.js";
import { validateMessageInput } from "../middlewares/validateMessage.middleware.js";

const router = express.Router();
const upload = multerMiddleware.single("file");

const logMulter = (req, res, next) => {
  console.log("Uploaded File:", req.file); // Check if the file is here
  console.log("Request Body:", req.body); // Check the rest of the data
  next();
};

router.post(
  "/send-message-to-group",
  upload,
  authenticateToken,
  authorizeRole(["admin", "instructor", "student"]),
  sendMessageToGroup
);

router.post(
  "/send-message-to-user/:userId",
  upload,
  authenticateToken,
  authorizeRole(["admin", "instructor", "student"]),
  logMulter,
  validateMessageInput,
  sendMessageToUser
);

router.get(
  "/group-messages/:groupId",
  authenticateToken,
  authorizeRole(["admin", "instructor", "student"]),
  getGroupMessages
);
router.get(
  "/user-messages/:userId",
  authenticateToken,
  authorizeRole(["admin", "instructor", "student"]),
  getUserMessages
);

router.get("/user-messages", authenticateToken, getUserMessages);

export default router;
