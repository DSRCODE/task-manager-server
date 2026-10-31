import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

import { env } from "./config/env.js";

import ApiResponse from "./utils/ApiResponse.js";
import ApiError from "./utils/ApiError.js";

import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";

const app = express();

// Trust proxy in production (Render, etc.)
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin (Postman/server-to-server)
      if (!origin || origin === env.CLIENT_URL) {
        return callback(null, true);
      }

      return callback(new ApiError(403, "Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  })
);

// Request body parsing
app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "10kb",
  })
);

// Cookie parsing
app.use(cookieParser());

// HTTP request logging
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Swagger API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      withCredentials: true,
    },
  })
);

// Swagger JSON
app.get("/api-docs.json", (req, res) => {
  res.status(200).json(swaggerSpec);
});

// Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: "UP",
        environment: env.NODE_ENV,
      },
      "Server is healthy"
    )
  );
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRoutes);

// Handle unknown routes
app.use(notFoundMiddleware);

// Global error handler (must be last)
app.use(errorMiddleware);

export default app;
