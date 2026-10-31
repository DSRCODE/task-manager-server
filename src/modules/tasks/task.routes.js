import { Router } from "express";
import authenticate  from "../../middlewares/auth.middleware.js"; 
import  validate  from "../../middlewares/validate.middleware.js";
import {
  createTaskSchema,
  getTaskByIdSchema,
  updateTaskSchema,
  deleteTaskSchema,
  getTasksSchema,
} from "./task.validation.js";
import {
  createTask,
  getTaskById,
  getTasks,
  updateTask,
  deleteTask,
  deleteAllTasks,
} from "./task.controller.js";

const router = Router();

router.use(authenticate);

router
  .route("/")
  .get(validate(getTasksSchema), getTasks)
  .post(validate(createTaskSchema), createTask)
  .delete(deleteAllTasks);

router
  .route("/:id")
  .get(validate(getTaskByIdSchema), getTaskById)
  .patch(validate(updateTaskSchema), updateTask)
  .delete(validate(deleteTaskSchema), deleteTask);

export default router;
