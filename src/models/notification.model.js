import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
  type: {
    type: String,
    default: "general",
  },
  message: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", default: null },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  groupId: { type: Schema.Types.ObjectId, ref: "Group", default: null }, // Add groupId field
  groupDetails: { type: Schema.Types.Mixed, default: null }, // Add groupDetails field
});

export const Notification = mongoose.model("Notification", notificationSchema);
