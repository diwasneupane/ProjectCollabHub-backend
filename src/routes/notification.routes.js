import express from "express";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";

const router = express.Router();

router.post("/send-notification", async (req, res) => {
  try {
    const { type, message, recipientIds, sender } = req.body;

    // Create a new notification
    const notification = new Notification({
      type,
      message,
      sender,
    });

    // Send to specified recipients
    const recipients = await User.find({ _id: { $in: recipientIds } });
    await Promise.all(
      recipients.map(async (recipient) => {
        recipient.notifications.push(notification._id);
        await recipient.save();
      })
    );

    await notification.save();
    res.status(200).send("Notification sent");
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).send("Server error");
  }
});

export default router;
