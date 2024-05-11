import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "instructor", "student"],
      required: true,
    },
    studentId: {
      type: Number,
      validate: {
        validator: function (value) {
          return this.role === "student" ? Boolean(value) : true;
        },
        message: "Student ID is required for students",
      },
      sparse: true,
      unique: true, // Ensure uniqueness
    },
    fullName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    refreshToken: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isRemoved: {
      type: Boolean,
      default: false,
    },
    notifications: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
    ],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  },
  { timestamps: true }
);

// HashPassword
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);

  if (this.role === "instructor" || this.role === "admin") {
    this.isApproved = true;
  } else if (this.role === "student") {
    this.isApproved = false;
  }

  next();
});

// Check Password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
