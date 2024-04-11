import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { z } from "zod";

import userValidation from "../utils/user_validation.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, password, role, studentId, fullName } = req.body;

  if (role === "student" && !studentId) {
    throw new ApiError(400, "Student ID is required for students");
  }

  if (role !== "student" && studentId) {
    throw new ApiError(400, "Only students can have a Student ID");
  }

  try {
    userValidation.parse({ username, password });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => err.message).join("; ");
      throw new ApiError(400, `User validation failed: ${errorMessage}`);
    } else {
      throw new ApiError(400, "User validation failed");
    }
  }

  if ([username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(409, "All fields are required");
  }

  const existedUser = await User.findOne({ username });
  if (existedUser) {
    throw new ApiError(400, "Username already exists");
  }

  const user = await User.create({
    username,
    password,
    role,
    ...(role === "student" && { studentId }),
    fullName,
  });

  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Error while creating user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
