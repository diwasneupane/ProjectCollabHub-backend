import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized: Token not provided");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Logging decoded token (excluding sensitive data)
    console.log({
      userId: decodedToken?._id,
      username: decodedToken?.username,
    });

    // Retrieve user from database using token payload
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Unauthorized: User not found");
    }

    // Attach user object to request for further processing
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Unauthorized: Token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, "Unauthorized: Invalid token");
    } else {
      throw new ApiError(401, error?.message || "Unauthorized: Invalid token");
    }
  }
});
