import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addProject = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, status } = req.body;

  try {
    const project = new Project({
      title,
      description,
      startDate,
      endDate,
      status,
    });
    const savedProject = await project.save();
    res
      .status(201)
      .json(new ApiResponse(201, savedProject, "Project added successfully"));
  } catch (error) {
    res.status(400).json(new ApiError(400, error.message));
  }
});

const deleteProject = asyncHandler(async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) {
      throw new ApiError(404, "Project not found");
    }
    res.json(new ApiResponse(200, "Project deleted successfully"));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});

const updateProject = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, status } = req.body;

  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, startDate, endDate, status },
      { new: true }
    );
    if (!updatedProject) {
      throw new ApiError(404, "Project not found");
    }
    res.json(
      new ApiResponse(200, updatedProject, "Project updated successfully")
    );
  } catch (error) {
    res
      .status(error.statusCode || 400)
      .json(new ApiError(error.statusCode || 400, error.message));
  }
});
const getProjects = asyncHandler(async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

export { addProject, deleteProject, updateProject, getProjects };
