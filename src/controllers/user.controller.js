import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { z } from "zod";
import userValidation from "../utils/user_validation.js";

const generateAccessAndRefreshTokens = async (_id) => {
  try {
    const user = await User.findById(_id);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generate refresh and access token"
    );
  }
};

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

// Admin login controller
const adminLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const admin = await User.findOne({ username, role: "admin" });
  if (!admin || !(await admin.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    admin._id
  );
  const loggedInUser = await User.findById(admin._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "LoggedIn SuccessFull"
      )
    );
});

// Instructor login controller
const instructorLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const instructor = await User.findOne({ username, role: "instructor" });
  if (!instructor || !(await instructor.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    instructor._id
  );
  const loggedInUser = await User.findById(instructor._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "LoggedIn SuccessFull"
      )
    );
});

// Student login controller
const studentLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const student = await User.findOne({ username, role: "student" });
  if (!student || !(await student.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    student._id
  );
  const loggedInUser = await User.findById(student._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "LoggedIn SuccessFull"
      )
    );
});

export { registerUser, adminLogin, instructorLogin, studentLogin };
