import Group from "../models/groups.model.js";
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create Group
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

// Get All Groups
const getAllGroups = asyncHandler(async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(new ApiResponse(200, groups, "Groups fetched successfully"));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

// Get Group by ID
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

// Update Group
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

// Delete Group
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

// Link Project to Group
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
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});

export {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  linkProjectToGroup,
};
