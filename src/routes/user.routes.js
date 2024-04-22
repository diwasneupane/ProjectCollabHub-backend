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
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);

router.get("/pendingApproval", getPendingApprovalRequests);
router.patch("/users-approve/:userId", approveUser);

router.delete("/users-delete/:userId", removeMember);

export default router;
