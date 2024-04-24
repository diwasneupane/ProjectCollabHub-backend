import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  message: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", default: null },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

export const Notification = mongoose.model("Notification", notificationSchema);
