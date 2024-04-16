import { Router } from "express";
import {
  addProject,
  deleteProject,
  getProjects,
  updateProject,
} from "../controllers/project.controller.js";

const router = Router();

router.route("/addProjects").post(addProject);
router.route("/Projects").get(getProjects);

router.route("/updateProjects/:id").patch(updateProject);
router.route("/deleteProjects/:id").delete(deleteProject);

export default router;
