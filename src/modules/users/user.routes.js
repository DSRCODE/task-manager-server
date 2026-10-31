import { Router } from "express";

import authMiddleware from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  getProfile,
  updateProfile,
  deactivateAccount,
  deleteAccount,
} from "./user.controller.js";

import {
  getProfileSchema,
  updateProfileSchema,
  deactivateAccountSchema,
  deleteAccountSchema,
} from "./user.validation.js";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", validate(getProfileSchema), getProfile);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Daljeet Singh
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.patch("/me", validate(updateProfileSchema), updateProfile);


/**
 * @swagger
 * /users/me/deactivate:
 *   patch:
 *     summary: Deactivate current user's account
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 *       401:
 *         description: Invalid password or unauthorized
 */
router.patch(
  "/me/deactivate",
  validate(deactivateAccountSchema),
  deactivateAccount
);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Permanently delete current user's account
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account permanently deleted
 *       401:
 *         description: Invalid password or unauthorized
 */
router.delete(
  "/me",
  validate(deleteAccountSchema),
  deleteAccount
);

export default router;
