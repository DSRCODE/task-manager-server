import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

import { env } from "../config/env.js";

import { validateSession } from "../modules/auth/auth.service.js";

const authenticate = asyncHandler(async (req, res, next) => {
  const sessionToken = req.cookies?.[env.COOKIE_NAME];

  if (!sessionToken) {
    throw new ApiError(401, "Authentication required");
  }

  const result = await validateSession(sessionToken);

  if (!result) {
    res.clearCookie(env.COOKIE_NAME, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      path: "/",
      ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
    });

    throw new ApiError(401, "Session expired or invalid. Please login again.");
  }

  req.user = result.user;
  req.session = result.session;

  next();
});

export default authenticate;
