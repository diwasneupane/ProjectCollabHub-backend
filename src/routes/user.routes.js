import { Router } from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  approveUser,
  removeMember,
  getPendingApprovalRequests,
  logoutUser,
  fetchUserRoleById,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticateToken, logoutUser);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);

router.get("/pendingApproval", getPendingApprovalRequests);
router.patch("/users-approve/:userId", approveUser);

router.delete("/users-delete/:userId", removeMember);
router.get("/role/:userId", fetchUserRoleById);

export default router;
