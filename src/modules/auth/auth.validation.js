import { z } from "zod";

import { AUTH_CONSTANTS } from "./auth.constants.js";

const passwordSchema = z
  .string()
  .min(
    AUTH_CONSTANTS.PASSWORD_MIN_LENGTH,
    `Password must contain at least ${AUTH_CONSTANTS.PASSWORD_MIN_LENGTH} characters`
  )
  .max(
    AUTH_CONSTANTS.PASSWORD_MAX_LENGTH,
    `Password cannot exceed ${AUTH_CONSTANTS.PASSWORD_MAX_LENGTH} characters`
  )
  .refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password cannot exceed 72 bytes"
  );

const emailSchema = z
  .string()
  .trim()
  .email("Please provide a valid email address")
  .max(254)
  .toLowerCase();

const tokenSchema = z
  .string()
  .regex(/^[a-f0-9]{64}$/i, "Invalid or malformed token");

export const emptyRequestSchema = z
  .object({
    body: z.object({}).strict(),
    params: z.object({}).strict(),
    query: z.object({}).strict(),
  })
  .strict();

export const loginSchema = z.object({
  body: z
    .object({
      email: emailSchema,

      password: z.string().min(1, "Password is required"),
    })
    .strict(),

  params: z.object({}),

  query: z.object({}),
});


export const registerSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(60, "Name cannot exceed 60 characters"),

      email: emailSchema,

      password: passwordSchema,

      confirmPassword: z.string(),
    })
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),

  params: z.object({}),

  query: z.object({}),
});

export const sessionIdSchema = z.object({
  body: z.object({}),

  params: z
    .object({
      sessionId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid session ID"),
    })
    .strict(),

  query: z.object({}),
});

// Forgot password
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }).strict(),

  params: z.object({}).strict(),
  query: z.object({}).strict(),
});

// Reset password
export const resetPasswordSchema = z.object({
  body: z.object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
    .strict()
    .refine(
      (data) => data.password === data.confirmPassword,
      {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }
    ),

  params: z.object({
    token: tokenSchema,
  }).strict(),

  query: z.object({}).strict(),
});

// Change password
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),

    newPassword: passwordSchema,

    confirmNewPassword: z.string(),
  })
    .strict()
    .refine(
      (data) => data.newPassword === data.confirmNewPassword,
      {
        message: "Passwords do not match",
        path: ["confirmNewPassword"],
      }
    )
    .refine(
      (data) => data.currentPassword !== data.newPassword,
      {
        message: "New password must be different from current password",
        path: ["newPassword"],
      }
    ),

  params: z.object({}).strict(),
  query: z.object({}).strict(),
});