import { Router } from "express";
import {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  linkProjectToGroup,
} from "../controllers/group.controller.js";

const router = Router();

router.post("/addGroups", createGroup);
router.get("/getGroups", getAllGroups);
router.get("/getGroup/:id", getGroupById);
router.patch("/updateGroups/:id", updateGroup);
router.delete("/deleteGroups/:id", deleteGroup);
router.put("/groups/:groupId/link-project/:projectId", linkProjectToGroup);

export default router;
