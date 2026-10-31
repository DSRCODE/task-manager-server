import bcrypt from "bcryptjs";

import { AUTH_CONSTANTS } from "../modules/auth/auth.constants.js";

export const hashPassword = async (password) => {
  return bcrypt.hash(password, AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};
