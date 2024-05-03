import { Router } from "express";
import {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  assignStudentToGroup,
  addInstructorToGroup,
  removeStudentFromGroup,
  getGroupWithMembers,
  flagGroupAsAtRisk,
  getGroupMessages,
  getGroupsByStudentId,
} from "../controllers/group.controller.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/auth.middlewares.js";

const router = Router();

router.post(
  "/groups",
  authenticateToken,
  authorizeRole(["admin", "instructor"]),
  createGroup
);
router.delete(
  "/groups/:id",
  authenticateToken,
  authorizeRole(["admin", "instructor"]),
  deleteGroup
);
router.patch(
  "/groups/:id",
  authenticateToken,
  authorizeRole(["admin", "instructor"]),
  updateGroup
);
router.put(
  "/groups/:groupId/add-instructor/:userId",
  authenticateToken,
  authorizeRole(["admin"]),
  addInstructorToGroup
);

router.put(
  "/groups/:groupId/assign-student/:userId",
  authenticateToken,
  authorizeRole(["admin", "instructor"]),
  assignStudentToGroup
);
router.delete(
  "/groups/:groupId/remove-student/:userId",
  authenticateToken,
  authorizeRole(["admin", "instructor"]),
  removeStudentFromGroup
);
router.get(
  "/groups",

  getAllGroups
);
router.get(
  "/groups/:id",
  authenticateToken,
  authorizeRole(["admin", "instructor", "student"]),
  getGroupById
);
router.get(
  "/groups/:groupId/members",
  authenticateToken,
  authorizeRole(["instructor", "admin", "student"]),
  getGroupWithMembers
);
router.get(
  "/groups/:groupId/messages",
  authenticateToken,
  authorizeRole(["admin", "instructor", "student"]),
  getGroupMessages
);

router.patch(
  "/groups/:groupId/flag-at-risk",
  authenticateToken,
  authorizeRole(["instructor", "admin"]),
  flagGroupAsAtRisk
);
router.get("/groups/:studentId", getGroupsByStudentId);

export default router;
