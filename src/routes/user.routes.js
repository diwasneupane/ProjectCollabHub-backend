import { Router } from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  approveUser,
  removeMember,
  getPendingApprovalRequests,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);
router.post("/login", loginUser);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);

// Route to approve user
router.get("/pendingApproval", getPendingApprovalRequests);
router.patch("/users-approve/:userId", approveUser);

// Route to remove user
router.delete("/users-delete/:userId", removeMember);

export default router;
