import { Router } from "express";
import {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  linkProjectToGroup,
  assignStudentToGroup,
  addInstructorToGroup,
} from "../controllers/group.controller.js";

const router = Router();

router.post("/addGroups", createGroup);
router.get("/getGroups", getAllGroups);
router.get("/getGroup/:id", getGroupById);
router.patch("/updateGroups/:id", updateGroup);
router.delete("/deleteGroups/:id", deleteGroup);
router.put("/groups/:groupId/link-project/:projectId", linkProjectToGroup);
router.put("/groups/:groupId/assign-student/:userId", assignStudentToGroup);

router.put("/groups/:groupId/add-instructor/:userId", addInstructorToGroup);

export default router;
