import { Router } from "express";
import {
  registerUser,
  adminLogin,
  instructorLogin,
  studentLogin,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

router.post("/admin/login", adminLogin);

router.post("/instructor/login", instructorLogin);
router.post("/student/login", studentLogin);
export default router;
