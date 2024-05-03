import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const errorHandler = (res, error) => {
  console.error("Error:", error);
  res.status(500).json({ success: false, message: "Server error." });
};
export const sendNotification = async (req, res) => {
  try {
    const { type, message, recipientIds } = req.body;

    const token = req.cookies.accessToken;

    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedToken) => {
        if (err) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid token.",
          });
        }

        const sender = decodedToken.userId;

        if (!type || !message || !recipientIds) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields.",
          });
        }

        const notification = new Notification({
          type,
          message,
          sender,
        });

        const recipients = await User.find({ _id: { $in: recipientIds } });
        await Promise.all(
          recipients.map(async (recipient) => {
            recipient.notifications.push(notification._id);
            await recipient.save();
          })
        );

        await notification.save();

        return res.status(200).json({
          success: true,
          message: "Notification sent.",
        });
      }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ date: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    errorHandler(res, error);
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res
        .status(400)
        .json({ success: false, message: "Notification ID is required." });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found." });
    }

    notification.read = true;
    await notification.save();

    res
      .status(200)
      .json({ success: true, message: "Notification marked as read." });
  } catch (error) {
    errorHandler(res, error);
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res
        .status(400)
        .json({ success: false, message: "Notification ID is required." });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found." });
    }

    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ success: true, message: "Notification deleted." });
  } catch (error) {
    errorHandler(res, error);
  }
};
