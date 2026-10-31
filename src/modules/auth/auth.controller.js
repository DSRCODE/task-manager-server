import {
  registerUser,
  loginUser,
  createSession,
  logoutUser,
  logoutAllSessions,
  getUserSessions,
  revokeSession,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  changePassword as changePasswordService,
} from "./auth.service.js";

import ApiResponse from "../../utils/ApiResponse.js";

import asyncHandler from "../../utils/asyncHandler.js";

import {
  getCookieOptions,
  getClearCookieOptions,
} from "../../config/cookie.js";

import { env } from "../../config/env.js";

const setSessionCookie = (res, sessionToken) => {
  const maxAge = env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

  res.cookie(env.COOKIE_NAME, sessionToken, getCookieOptions(maxAge));
};

const clearSessionCookie = (res) => {
  res.clearCookie(env.COOKIE_NAME, getClearCookieOptions());
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.validated.body;

  const user = await registerUser({
    name,
    email,
    password,
  });

  const { sessionToken } = await createSession(user._id, {
    userAgent: req.get("user-agent"),
    ipAddress: req.ip,
  });

  setSessionCookie(res, sessionToken);

  return res
    .status(201)
    .json(new ApiResponse(201, { user }, "Account created successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  const { user, sessionToken } = await loginUser({
    email,
    password,
    metadata: {
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    },
  });

  setSessionCookie(res, sessionToken);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Login successful"));
});

export const logout = asyncHandler(async (req, res) => {
  const sessionToken = req.cookies?.[env.COOKIE_NAME];

  await logoutUser(sessionToken);

  clearSessionCookie(res);

  return res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

export const logoutAll = asyncHandler(async (req, res) => {
  const deletedCount = await logoutAllSessions(req.user._id);

  clearSessionCookie(res);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { deletedCount }, "All sessions have been revoked")
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: req.user },
        "User profile fetched successfully"
      )
    );
});

export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await getUserSessions(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { sessions }, "Sessions fetched successfully"));
});

export const revokeUserSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.validated.params;

  await revokeSession(req.user._id, sessionId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Session revoked successfully"));
});


export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.validated.body;

  const { resetToken } = await forgotPasswordService(email);

  const data = {
    message: "If an account exists, a password reset request has been created.",
  };

  // Never expose reset tokens outside development
  if (env.NODE_ENV === "development" && resetToken) {
    data.resetToken = resetToken;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Password reset request processed"));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.validated.params;

  const { password } = req.validated.body;

  await resetPasswordService({
    token,
    newPassword: password,
  });

  clearSessionCookie(res);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Password reset successfully. Please login again."
      )
    );
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validated.body;

  await changePasswordService({
    userId: req.user._id,
    currentPassword,
    newPassword,
  });

  clearSessionCookie(res);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Password changed successfully. Please login again."
      )
    );
});
