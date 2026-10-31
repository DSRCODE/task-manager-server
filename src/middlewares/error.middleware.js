import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let error = err;

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];

    error = new ApiError(409, `${field || "Field"} already exists`);
  }

  // Mongoose validation error
  else if (err.name === "ValidationError") {
    const errors = Object.values(err.errors || {}).map((item) => item.message);

    error = new ApiError(400, "Database validation failed", errors);
  }

  // Invalid MongoDB ObjectId
  else if (err.name === "CastError") {
    error = new ApiError(400, "Invalid resource ID");
  }

  // Unexpected or custom errors
  const statusCode = error.statusCode || error.status || 500;

  const message =
    statusCode >= 500 && env.NODE_ENV === "production"
      ? "Internal Server Error"
      : error.message || "Something went wrong";

  const response = {
    success: false,
    statusCode,
    message,
    errors: error.errors || [],
  };

  // Show stack only during development
  if (env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};

export default errorMiddleware;
