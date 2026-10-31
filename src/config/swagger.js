import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "Task Management API",
      version: "1.0.0",
      description: `
        REST API documentation for the MERN Task Management Application.

        Features:
        - User authentication
        - Cookie-based sessions
        - User management
        - Task management
        - Advanced task filtering
        - Calendar and scheduling
      `,
      contact: {
        name: "API Support",
      },
    },

    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: "Development Server",
      },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: env.COOKIE_NAME,
          description:
            "Authentication is handled through an HttpOnly session cookie.",
        },
      },

      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            statusCode: {
              type: "integer",
              example: 200,
            },
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Request successful",
            },
            data: {
              type: "object",
              nullable: true,
            },
          },
        },

        ApiError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            statusCode: {
              type: "integer",
              example: 400,
            },
            message: {
              type: "string",
              example: "Validation failed",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
              },
            },
          },
        },
      },
    },
  },

  apis: ["./src/modules/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
