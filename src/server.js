import http from "node:http";

import app from "./app.js";
import connectDatabase from "./config/database.js";
import { env } from "./config/env.js";

import mongoose from "mongoose";

let server;

const startServer = async () => {
  try {
    // Connect MongoDB first
    await connectDatabase();

    // Start HTTP server
    server = http.createServer(app);

    server.listen(env.PORT, () => {
      console.log("--------------------------------");
      console.log("Task Management API Started");
      console.log(`Port: ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`URL: http://localhost:${env.PORT}`);
      console.log("--------------------------------");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);

    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down...`);

  if (server) {
    server.close(async () => {
      try {
        await mongoose.disconnect();

        console.log("MongoDB disconnected.");
        console.log("Server shutdown completed.");

        process.exit(0);
      } catch (error) {
        console.error("Shutdown error:", error);
        process.exit(1);
      }
    });
  } else {
    await mongoose.disconnect();
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
