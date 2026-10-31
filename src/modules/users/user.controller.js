import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  getUserProfile,
  updateUserProfile,
  deactivateUserAccount,
  deleteUserAccount,
} from "./user.service.js";

import { getClearCookieOptions } from "../../config/cookie.js";

export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Profile fetched successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateUserProfile(req.user._id, req.validated.body);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Profile updated successfully"));
});

export const deactivateAccount = asyncHandler(async (req, res) => {
  await deactivateUserAccount(req.user._id, req.validated.body.password);

  res.clearCookie(env.COOKIE_NAME, getClearCookieOptions());

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Account deactivated successfully"));
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await deleteUserAccount(req.user._id, req.validated.body.password);

  res.clearCookie(env.COOKIE_NAME, getClearCookieOptions());

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Account permanently deleted successfully")
    );
});