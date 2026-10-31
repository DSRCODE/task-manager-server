import { Types } from "mongoose";
import { z } from "zod";

export const createTaskSchema = z.object({
  body: z
    .object({
      title: z
        .string({ required_error: "Task title is required" })
        .trim()
        .min(2, "Task title must contain at least 2 characters")
        .max(120, "Task title cannot exceed 120 characters"),

      description: z
        .string()
        .trim()
        .max(2000, "Description cannot exceed 2000 characters")
        .optional()
        .default(""),

      status: z
        .enum(["pending", "in_progress", "completed"])
        .optional()
        .default("pending"),

      priority: z
        .enum(["low", "medium", "high", "urgent"])
        .optional()
        .default("medium"),

      startDate: z
        .string()
        .datetime({ message: "Start date must be a valid ISO date string" })
        .optional()
        .nullable()
        .transform((val) => (val ? new Date(val) : null)),

      dueDate: z
        .string()
        .datetime({ message: "Due date must be a valid ISO date string" })
        .optional()
        .nullable()
        .transform((val) => (val ? new Date(val) : null)),
    })
    .refine(
      (data) => {
        if (data.startDate && data.dueDate && data.dueDate < data.startDate) {
          return false;
        }
        return true;
      },
      {
        message: "Due date cannot be earlier than start date",
        path: ["dueDate"],
      }
    ),
});



export const getTaskByIdSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid task ID format",
    }),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid task ID format",
    }),
  }),
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(2, "Task title must contain at least 2 characters")
        .max(120, "Task title cannot exceed 120 characters")
        .optional(),

      description: z
        .string()
        .trim()
        .max(2000, "Description cannot exceed 2000 characters")
        .optional(),

      status: z.enum(["pending", "in_progress", "completed"]).optional(),

      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),

      startDate: z
        .string()
        .datetime({ message: "Start date must be a valid ISO date string" })
        .optional()
        .nullable()
        .transform((val) => (val ? new Date(val) : null)),

      dueDate: z
        .string()
        .datetime({ message: "Due date must be a valid ISO date string" })
        .optional()
        .nullable()
        .transform((val) => (val ? new Date(val) : null)),
    })
    .refine(
      (data) => {
        if (data.startDate && data.dueDate && data.dueDate < data.startDate) {
          return false;
        }
        return true;
      },
      {
        message: "Due date cannot be earlier than start date",
        path: ["dueDate"],
      }
    ),
});


export const getTasksSchema = z.object({
  query: z
    .object({
      status: z.enum(["pending", "in_progress", "completed"]).optional(),

      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),

      search: z.string().trim().optional(),

      startDate: z
        .string()
        .datetime({ message: "Start date must be a valid ISO date string" })
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),

      dueDate: z
        .string()
        .datetime({ message: "Due date must be a valid ISO date string" })
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
    })
    .optional(),
});

export const deleteTaskSchema = getTaskByIdSchema;
