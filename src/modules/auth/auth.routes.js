import { Router } from "express";

import validate from "../../middlewares/validate.middleware.js";
import authenticate from "../../middlewares/auth.middleware.js";

import {
  registerSchema,
  loginSchema,
  emptyRequestSchema,
  sessionIdSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./auth.validation.js";

import {
  register,
  login,
  logout,
  logoutAll,
  getCurrentUser,
  getSessions,
  revokeUserSession,
  forgotPassword,
  resetPassword,
  changePassword,
} from "./auth.controller.js";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/logout", validate(emptyRequestSchema), logout);

// Protected routes
router.get("/me", authenticate, validate(emptyRequestSchema), getCurrentUser);

router.post(
  "/logout-all",
  authenticate,
  validate(emptyRequestSchema),
  logoutAll
);

router.get(
  "/sessions",
  authenticate,
  validate(emptyRequestSchema),
  getSessions
);

router.delete(
  "/sessions/:sessionId",
  authenticate,
  validate(sessionIdSchema),
  revokeUserSession
);


// Password management

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPassword
);

router.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  changePassword
);

export default router;
