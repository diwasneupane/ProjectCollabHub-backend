import { Router } from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);
router.post("/login", loginUser);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);

export default router;
