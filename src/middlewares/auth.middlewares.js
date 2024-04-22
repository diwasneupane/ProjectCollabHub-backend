import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authenticateToken = asyncHandler(async (req, res, next) => {
  let token = null;

  if ((req.cookies && req.cookies.accessToken) || req.body.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError(401, "Unauthorized: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = {
      _id: decoded._id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return next(new ApiError(401, "Unauthorized: Invalid or expired token"));
  }
});
const authorizeRole = (allowedRoles) =>
  asyncHandler((req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ApiError(401, "Access denied: User not authenticated"));
    }

    const userRole = req.user.role;
    console.log("User role:", userRole);

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ApiError(403, `Access denied: Role '${userRole}' not allowed`)
      );
    }

    next();
  });

export { authenticateToken, authorizeRole };
