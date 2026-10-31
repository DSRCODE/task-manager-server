import mongoose from "mongoose";

import User from "../users/user.model.js";
import AuthToken from "./auth-token.model.js";
import Session from "./session.model.js";

import { createUser, findUserByEmail } from "../users/user.service.js";

import { comparePassword, hashPassword } from "../../utils/password.js";

import { generateToken, hashToken } from "../../utils/generateToken.js";

import ApiError from "../../utils/ApiError.js";

import { env } from "../../config/env.js";

export const createSession = async (userId, metadata = {}) => {
  const sessionToken = generateToken();

  const tokenHash = hashToken(sessionToken);

  const expiresAt = new Date(
    Date.now() + env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  const session = await Session.create({
    user: userId,
    tokenHash,
    expiresAt,
    userAgent: metadata.userAgent || null,
    ipAddress: metadata.ipAddress || null,
  });

  return {
    session,
    sessionToken,
  };
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await createUser({
    name,
    email,
    password,
  });

  return user;
};

export const loginUser = async ({ email, password, metadata }) => {
  const user = await findUserByEmail(email, true);

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account is currently inactive");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { session, sessionToken } = await createSession(user._id, metadata);

  return {
    user,
    session,
    sessionToken,
  };
};

export const validateSession = async (sessionToken) => {
  if (!sessionToken) {
    return null;
  }

  const tokenHash = hashToken(sessionToken);

  const session = await Session.findOne({
    tokenHash,
    expiresAt: {
      $gt: new Date(),
    },
  })
    .select("+tokenHash")
    .populate("user");

  if (!session || !session.user) {
    return null;
  }

  if (!session.user.isActive) {
    return null;
  }

  // Update last activity
  session.lastUsedAt = new Date();

  await session.save();

  return {
    session,
    user: session.user,
  };
};

export const logoutUser = async (sessionToken) => {
  if (!sessionToken) {
    return;
  }

  const tokenHash = hashToken(sessionToken);

  await Session.findOneAndDelete({
    tokenHash,
  });
};

export const logoutAllSessions = async (userId) => {
  const result = await Session.deleteMany({
    user: userId,
  });

  return result.deletedCount;
};

export const getUserSessions = async (userId) => {
  return Session.find({
    user: userId,
    expiresAt: {
      $gt: new Date(),
    },
  })
    .select("-tokenHash")
    .sort({ lastUsedAt: -1 });
};

export const revokeSession = async (userId, sessionId) => {
  const session = await Session.findOneAndDelete({
    _id: sessionId,
    user: userId,
  });

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  return session;
};


export const forgotPassword = async (email) => {
  // Without an email provider, reset links are only
  // returned in development mode.
  if (env.NODE_ENV !== "development") {
    throw new ApiError(503, "Password reset delivery is not configured");
  }

  const user = await findUserByEmail(email);

  // Do not reveal whether an account exists.
  if (!user || !user.isActive) {
    return {
      resetToken: null,
    };
  }

  // Invalidate previously generated reset tokens
  await AuthToken.deleteMany({
    user: user._id,
    purpose: "password_reset",
  });

  // Generate a new secure token
  const resetToken = generateToken();

  const tokenHash = hashToken(resetToken);

  const expiresAt = new Date(
    Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60 * 1000
  );

  await AuthToken.create({
    user: user._id,
    tokenHash,
    purpose: "password_reset",
    expiresAt,
  });

  return {
    resetToken,
  };
};

export const resetPassword = async ({ token, newPassword }) => {
  const tokenHash = hashToken(token);

  const hashedPassword = await hashPassword(newPassword);

  const dbSession = await mongoose.startSession();

  try {
    await dbSession.withTransaction(async () => {
      const authToken = await AuthToken.findOneAndUpdate(
        {
          tokenHash,
          purpose: "password_reset",
          usedAt: null,
          expiresAt: {
            $gt: new Date(),
          },
        },
        {
          $set: {
            usedAt: new Date(),
          },
        },
        {
          new: true,
          session: dbSession,
        }
      );

      if (!authToken) {
        throw new ApiError(
          400,
          "Reset token is invalid, expired or already used"
        );
      }

      const user = await User.findOne({
        _id: authToken.user,
        isActive: true,
      }).session(dbSession);

      if (!user) {
        throw new ApiError(404, "User account not found");
      }

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            password: hashedPassword,
            passwordChangedAt: new Date(),
          },
        },
        {
          session: dbSession,
        }
      );

      // Revoke all previously authenticated devices
      await Session.deleteMany({ user: user._id }, { session: dbSession });

      // Invalidate other outstanding reset tokens
      await AuthToken.deleteMany(
        {
          user: user._id,
          purpose: "password_reset",
          _id: { $ne: authToken._id },
        },
        { session: dbSession }
      );
    });

    return true;
  } finally {
    await dbSession.endSession();
  }
};

export const changePassword = async ({
  userId,
  currentPassword,
  newPassword,
}) => {
  const user = await User.findById(userId).select("+password");

  if (!user || !user.isActive) {
    throw new ApiError(404, "User account not found");
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const hashedPassword = await hashPassword(newPassword);

  const dbSession = await mongoose.startSession();

  try {
    await dbSession.withTransaction(async () => {
      await User.updateOne(
        { _id: userId },
        {
          $set: {
            password: hashedPassword,
            passwordChangedAt: new Date(),
          },
        },
        {
          session: dbSession,
        }
      );

      // Revoke all sessions, including the current one
      await Session.deleteMany({ user: userId }, { session: dbSession });

      await AuthToken.deleteMany(
        {
          user: userId,
          purpose: "password_reset",
        },
        { session: dbSession }
      );
    });

    return true;
  } finally {
    await dbSession.endSession();
  }
};
