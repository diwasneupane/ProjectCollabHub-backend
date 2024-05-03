import express from "express";
import {
  sendNotification,
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";
import {
  authorizeRole,
  authenticateToken,
} from "../middlewares/auth.middlewares.js"; // Import role authorization middleware

const router = express.Router();

router.post(
  "/send-notification",
  authenticateToken,
  authorizeRole(["admin", "instructor", "student"]),
  sendNotification
);
router.get(
  "/notification",
  authenticateToken,
  authorizeRole(["admin", "instructor", "student"]),
  getNotifications
);
router.patch(
  "/mark-read/:notificationId",
  authenticateToken,
  authorizeRole(["admin", "instructor", "student"]),
  markNotificationAsRead
);
router.delete(
  "/delete-notification/:notificationId",
  // authenticateToken,
  // authorizeRole(["admin", "instructor"]),
  deleteNotification
);

export default router;
