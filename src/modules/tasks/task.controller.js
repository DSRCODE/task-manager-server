import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  getTasksService,
  getTaskByIdService,
  createTaskService,
  updateTaskService,
  deleteTaskService,
  deleteAllTasksService,
} from "./task.service.js";

// Create Task
export const createTask = asyncHandler(async (req, res) => {
  const task = await createTaskService(req.user._id, req.validated.body);

  return res
    .status(201)
    .json(new ApiResponse(201, { task }, "Task created successfully"));
});

// Get All Tasks
export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await getTasksService(req.user._id, req.validated.query);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { tasks, count: tasks.length },
        "Tasks fetched successfully"
      )
    );
});

// Get Task By ID
export const getTaskById = asyncHandler(async (req, res) => {
  const task = await getTaskByIdService(req.user._id, req.validated.params.id);

  if (!task) {
    return res.status(404).json(new ApiResponse(404, null, "Task not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { task }, "Task fetched successfully"));
});

// Update Task
export const updateTask = asyncHandler(async (req, res) => {
  const task = await updateTaskService(
    req.user._id,
    req.validated.params.id,
    req.validated.body
  );

  if (!task) {
    return res.status(404).json(new ApiResponse(404, null, "Task not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { task }, "Task updated successfully"));
});

// Delete Single Task
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await deleteTaskService(req.user._id, req.validated.params.id);

  if (!task) {
    return res.status(404).json(new ApiResponse(404, null, "Task not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Task deleted successfully"));
});

// Delete All Tasks
export const deleteAllTasks = asyncHandler(async (req, res) => {
  const result = await deleteAllTasksService(req.user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedCount: result.deletedCount },
        `Successfully deleted ${result.deletedCount} tasks`
      )
    );
});
