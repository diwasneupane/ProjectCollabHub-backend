import Group from "../models/groups.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createGroup = asyncHandler(async (req, res) => {
  const { name } = req.body;
  try {
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      throw new ApiError(400, "Group with this name already exists");
    }
    const group = new Group({ name });
    await group.save();
    res
      .status(201)
      .json(new ApiResponse(201, group, "Group created successfully"));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});

const getAllGroups = asyncHandler(async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(new ApiResponse(200, groups, "Groups fetched successfully"));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

const getGroupById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const group = await Group.findById(id);
    if (!group) {
      throw new ApiError(404, "Group not found");
    }
    res.json(new ApiResponse(200, group, "Group fetched successfully"));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});

const updateGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const group = await Group.findByIdAndUpdate(id, { name }, { new: true });
    if (!group) {
      throw new ApiError(404, "Group not found");
    }
    res.json(new ApiResponse(200, group, "Group updated successfully"));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});

const deleteGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const group = await Group.findByIdAndDelete(id);
    if (!group) {
      throw new ApiError(404, "Group not found");
    }
    res.json(new ApiResponse(200, "Group deleted successfully"));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});

const linkProjectToGroup = asyncHandler(async (req, res) => {
  const { groupId, projectId } = req.params;
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new ApiError(404, "Group not found");
    }
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }
    if (group.projects.includes(projectId)) {
      throw new ApiError(400, "Project already linked to the group");
    }
    group.projects.push(projectId);
    await group.save();
    res.json(
      new ApiResponse(200, group, "Project linked to the group successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    } else {
      return res
        .status(500)
        .json(new ApiResponse(500, null, "Internal Server Error"));
    }
  }
});

const assignStudentToGroup = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.params;
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role !== "student") {
      throw new ApiError(400, "User is not a student");
    }

    if (group.students.includes(userId)) {
      throw new ApiError(400, "Student is already assigned to this group");
    }

    group.students.push(userId);
    await group.save();

    res.json(
      new ApiResponse(200, group, "Student assigned to group successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    } else {
      return res
        .status(500)
        .json(new ApiResponse(500, null, "Internal Server Error"));
    }
  }
});

const addInstructorToGroup = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.params;
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new ApiError(404, "Group not found");
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (user.role !== "instructor") {
      throw new ApiError(400, "User is not an instructor");
    }
    group.instructor = userId;
    await group.save();
    res.json(
      new ApiResponse(200, group, "Instructor added to group successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    } else {
      return res
        .status(500)
        .json(new ApiResponse(500, null, "Internal Server Error"));
    }
  }
});

export {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  linkProjectToGroup,
  addInstructorToGroup,
  assignStudentToGroup,
};
