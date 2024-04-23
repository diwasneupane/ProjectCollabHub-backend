import { Router } from "express";
import {
  addProject,
  deleteProject,
  getProjects,
  updateProject,
} from "../controllers/project.controller.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/auth.middlewares.js";

const router = Router();

router
  .route("/addProjects")
  .post(authenticateToken, authorizeRole(["admin", "instructor"]), addProject);

router.route("/Projects").get(getProjects);

router
  .route("/updateProjects/:id")
  .patch(
    authenticateToken,
    authorizeRole(["admin", "instructor"]),
    updateProject
  );

router
  .route("/deleteProjects/:id")
  .delete(
    authenticateToken,
    authorizeRole(["admin", "instructor"]),
    deleteProject
  );

export default router;
