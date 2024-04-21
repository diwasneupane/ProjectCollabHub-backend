import express from "express";
import {
  sendMessageToGroup,
  sendMessageToUser,
  wordSearchInGroups,
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

router.post(
  "/send-message-to-group",
  authenticateToken,
  authorizeRole(["admin", "instructor", "student"]),
  upload,
  sendMessageToGroup
);

router.post(
  "/send-message-to-user",
  authenticateToken,
  authorizeRole(["admin"]),
  upload,
  validateMessageInput,
  sendMessageToUser
);

router.get(
  "/word-search",
  authenticateToken,
  authorizeRole(["admin", "instructor", "student"]),
  wordSearchInGroups
);

router.get(
  "/group-messages/:groupId",
  authenticateToken,
  authorizeRole(["admin", "instructor", "student"]),
  getGroupMessages
);

router.get("/user-messages", authenticateToken, getUserMessages);

export default router;
