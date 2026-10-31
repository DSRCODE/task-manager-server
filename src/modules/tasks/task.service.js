import Task from "./task.model.js";

export const createTaskService = async (userId, taskData) => {
  const task = await Task.create({
    ...taskData,
    user: userId,
  });

  return task;
};

export const getTasksService = async (userId, queryParams = {}) => {
  const filter = { user: userId };

  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  if (queryParams.priority) {
    filter.priority = queryParams.priority;
  }

  if (queryParams.search) {
    filter.$or = [
      { title: { $regex: queryParams.search, $options: "i" } },
      { description: { $regex: queryParams.search, $options: "i" } },
    ];
  }

  if (queryParams.dueDate) {
    filter.dueDate = queryParams.dueDate;
  }

  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  return tasks;
};

export const getTaskByIdService = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, user: userId });
  return task;
};


export const updateTaskService = async (userId, taskId, updateData) => {
  if (updateData.status === "completed") {
    updateData.completedAt = new Date();
  } else if (updateData.status && updateData.status !== "completed") {
    updateData.completedAt = null;
  }

  const task = await Task.findOneAndUpdate(
    { _id: taskId, user: userId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return task;
};

export const deleteTaskService = async (userId, taskId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
  return task;
};

export const deleteAllTasksService = async (userId) => {
  const result = await Task.deleteMany({ user: userId });
  return result;
};
