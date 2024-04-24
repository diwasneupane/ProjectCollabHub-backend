import express from "express";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";

const router = express.Router();

// Send a new notification to specific users
router.post("/send-notification", async (req, res) => {
  try {
    const { type, message, recipientIds, sender } = req.body;

    // Create the notification
    const notification = new Notification({
      type,
      message,
      sender,
    });

    // Find and attach the notification to the specified users
    const recipients = await User.find({ _id: { $in: recipientIds } });
    await Promise.all(
      recipients.map(async (recipient) => {
        recipient.notifications.push(notification._id);
        await recipient.save();
      })
    );

    // Save the notification in the database
    await notification.save();
    res.status(200).json({ success: true, message: "Notification sent." });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// // Get all notifications for a specific user
// router.get("/user-notifications/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const user = await User.findById(userId).populate("notifications");
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found." });
//     }

//     res.status(200).json({ success: true, notifications: user.notifications });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// });

// Mark a notification as read
router.patch("/mark-read/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found." });
    }

    notification.isRead = true;
    await notification.save();

    res
      .status(200)
      .json({ success: true, message: "Notification marked as read." });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// Delete a specific notification
router.delete("/delete-notification/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found." });
    }

    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ success: true, message: "Notification deleted." });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

export default router;
