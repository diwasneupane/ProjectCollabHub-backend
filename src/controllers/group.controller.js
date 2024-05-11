import Group from "../models/groups.model.js";
import { Message } from "../models/message.model.js";
import { Notification } from "../models/notification.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const createGroup = asyncHandler(async (req, res) => {
  const { name, instructor, students, projects } = req.body;

  try {
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res
        .status(400)
        .json(new ApiError(error.statusCode, error.message));
    }
    const group = new Group({
      name,
      instructor,
      students: students || [],
      projects: projects || [],
    });

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
    const groups = await Group.find()
      .populate("instructor", "username")
      .populate("students", "username")
      .populate("projects", "title");

    res
      .status(200)
      .json(new ApiResponse(200, groups, "Groups fetched successfully"));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, "Error fetching groups"));
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
  const { name, instructor, students, projects } = req.body;

  try {
    const updatedData = {};

    if (name) {
      updatedData.name = name;
    }
    if (instructor) {
      updatedData.instructor = instructor;
    }
    if (students) {
      updatedData.students = students;
    }
    if (projects) {
      updatedData.projects = projects;
    }

    const group = await Group.findByIdAndUpdate(id, updatedData, { new: true });

    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    res.json(new ApiResponse(200, group, "Group updated successfully"));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiError(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
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
const removeStudentFromGroup = asyncHandler(async (req, res) => {
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

    if (!group.students.includes(userId)) {
      throw new ApiError(400, "Student is not in this group");
    }

    group.students = group.students.filter((id) => id.toString() !== userId);
    await group.save();

    res.json(
      new ApiResponse(200, group, "Student removed from group successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    } else {
      res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
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
const getGroupWithMembers = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findById(groupId).populate("students instructor");
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  res.json(new ApiResponse(200, group, "Group details fetched successfully"));
});

const getGroupMessages = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  try {
    const messages = await Message.find({ group: groupId })
      .populate("sender", "username")
      .sort({ createdAt: 1 });

    if (!messages) {
      throw new ApiError(404, "No messages found for the specified group");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { messages },
          "Group messages fetched successfully"
        )
      );
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Error fetching group messages"
        )
      );
  }
});

const flagGroupAsAtRisk = asyncHandler(async (req, res) => {
  const { groupId } = req.params; // Extract group ID from the request parameters
  const { atRisk } = req.body; // Extract the 'atRisk' status from the request body

  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  group.atRisk = atRisk; // Update the 'atRisk' status based on the request body
  await group.save();

  const userRole = req.user.role;

  const user = await User.findOne({ role: userRole });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const message = atRisk
    ? `Group '${group.name}' has been flagged as 'at risk'.`
    : `Group '${group.name}' has been unflagged from 'at risk'.`;

  // Fetch students and instructor details of the group
  const students = await User.find({ _id: { $in: group.students } });
  const instructor = await User.findById(group.instructor);

  // Create the notification object with additional details
  const notification = new Notification({
    message,
    recipient: user._id,
    sender: user._id,
    groupId: groupId, // Store the group ID in the notification
    groupDetails: {
      name: group.name,
      students: students.map((student) => ({
        _id: student._id,
        username: student.username,
      })),
      instructor: {
        _id: instructor._id,
        username: instructor.username,
      },
    },
  });

  await notification.save();
  console.log(notification);

  res.status(200).json({
    success: true,
    message: "Group's 'at risk' status updated successfully.",
  });
});

export const getGroupsByStudentId = async (req, res) => {
  try {
    // Extract studentId from request parameters
    const { studentId } = req.params;

    // Find groups where the student is a member
    const groups = await Group.find({ students: studentId });

    // Return groups
    res.status(200).json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error("Error fetching groups by student ID:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  linkProjectToGroup,
  addInstructorToGroup,
  assignStudentToGroup,
  removeStudentFromGroup,
  getGroupWithMembers,
  getGroupMessages,
  flagGroupAsAtRisk,
};
