import mongoose from "mongoose";
import Session from "../auth/session.model.js";
import AuthToken from "../auth/auth-token.model.js";
import User from "./user.model.js";
import ApiError from "../../utils/ApiError.js";

import { hashPassword, comparePassword } from "../../utils/password.js";

export const createUser = async ({ name, email, password }) => {
  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

export const findUserByEmail = async (email, includePassword = false) => {
  let query = User.findOne({ email });

  if (includePassword) {
    query = query.select("+password");
  }

  return query;
};

export const findUserById = async (userId) => {
  return User.findById(userId);
};

export const updateUserPassword = async (userId, newPassword) => {
  const hashedPassword = await hashPassword(newPassword);

  return User.findByIdAndUpdate(
    userId,
    {
      $set: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

export const markEmailAsVerified = async (userId) => {
  return User.findByIdAndUpdate(
    userId,
    {
      $set: {
        isEmailVerified: true,
      },
    },
    {
      new: true,
    }
  );
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        name: updateData.name,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user || !user.isActive) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export const deactivateUserAccount = async (userId, password) => {
  const user = await User.findById(userId).select("+password");

  if (!user || !user.isActive) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const dbSession = await mongoose.startSession();

  try {
    await dbSession.withTransaction(async () => {
      const result = await User.updateOne(
        {
          _id: userId,
          password: user.password,
          isActive: true,
        },
        {
          $set: { isActive: false },
        },
        { session: dbSession }
      );

      if (result.modifiedCount !== 1) {
        throw new ApiError(
          409,
          "Account could not be deactivated. Please try again."
        );
      }

      await Session.deleteMany({ user: userId }, { session: dbSession });

      await AuthToken.deleteMany({ user: userId }, { session: dbSession });
    });
  } finally {
    await dbSession.endSession();
  }

  return true;
};

export const deleteUserAccount = async (userId, password) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const dbSession = await mongoose.startSession();

  try {
    await dbSession.withTransaction(async () => {
      const result = await User.deleteOne(
        {
          _id: userId,
          password: user.password,
        },
        { session: dbSession }
      );

      if (result.deletedCount !== 1) {
        throw new ApiError(
          409,
          "Account could not be deleted. Please try again."
        );
      }

      await Session.deleteMany({ user: userId }, { session: dbSession });

      await AuthToken.deleteMany({ user: userId }, { session: dbSession });
    });
  } finally {
    await dbSession.endSession();
  }

  return true;
};