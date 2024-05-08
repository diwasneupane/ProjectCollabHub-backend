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
  const { username, role, password, studentId, fullName, email, phone } =
    req.body;

  console.log("Received data:", req.body);
  if ([username, password, fullName].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  if (role === "student" && !studentId) {
    throw new ApiError(400, "Student ID is required for students");
  }

  try {
    userValidation.parse({ username, password, email, phone });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => err.message).join("; ");
      throw new ApiError(400, `User validation failed: ${errorMessage}`);
    } else {
      throw new ApiError(400, "User validation failed");
    }
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new ApiError(400, "Username already exists");
  }

  const user = await User.create({
    username,
    password,
    role,
    studentId: role === "student" ? studentId : undefined,
    fullName,
    email,
    phone,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.isApproved === false) {
    throw new ApiError(
      403,
      "User not approved. Please contact admin for approval."
    );
  }

  let role = "";
  if (user.role === "admin") {
    role = "admin";
  } else if (user.role === "instructor") {
    role = "instructor";
  } else if (user.role === "student") {
    role = "student";
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
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
        { user: loggedInUser, accessToken, refreshToken, role },
        "LoggedIn SuccessFull"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await User.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
const getPendingApprovalRequests = asyncHandler(async (req, res) => {
  const pendingUsers = await User.find({ isApproved: false });
  res.json(new ApiResponse(200, pendingUsers, "Pending approval requests"));
});

const approveUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isApproved } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    user.isApproved = isApproved;
    await user.save();
    res.json(new ApiResponse(200, user, "User approval status updated"));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken");
    res.json(new ApiResponse(200, users, "Users fetched successfully"));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id)
      .select("-password -refreshToken")
      .populate("messages");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    res.json(new ApiResponse(200, user, "User fetched successfully"));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});
const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    await User.findByIdAndDelete(userId);
    res.json(new ApiResponse(200, null, "Member removed from platform"));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});
const fetchUserRoleById = async (req, res) => {
  try {
    const { userId } = req.params;
    // Assuming you have a User model
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // Assuming user role is stored in a field called 'role'
    res.status(200).json({ success: true, role: user.role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getUserById,
  getPendingApprovalRequests,
  approveUser,
  removeMember,
  fetchUserRoleById,
};
