import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [2, "Task title must contain at least 2 characters"],
      maxlength: [120, "Task title cannot exceed 120 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    startDate: {
      type: Date,
      default: null,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// A user's tasks ordered by creation date.
taskSchema.index({ user: 1, createdAt: -1, _id: -1 });

// Filter tasks by status and due date.
taskSchema.index({ user: 1, status: 1, dueDate: 1 });

// Filter tasks by priority and due date.
taskSchema.index({ user: 1, priority: 1, dueDate: 1 });

// Ensure dueDate is not earlier than startDate.
taskSchema.pre("validate", function () {
  if (this.startDate && this.dueDate && this.dueDate < this.startDate) {
    this.invalidate("dueDate", "Due date cannot be earlier than start date");
  }
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
