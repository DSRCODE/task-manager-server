import { randomBytes, createHash } from "node:crypto";

import { AUTH_CONSTANTS } from "../modules/auth/auth.constants.js";

export const generateToken = (bytes = AUTH_CONSTANTS.SESSION_TOKEN_BYTES) => {
  return randomBytes(bytes).toString("hex");
};

export const hashToken = (token) => {
  return createHash("sha256").update(token).digest("hex");
};
