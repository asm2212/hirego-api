import { Router } from "express";
import {
  getAllUsers,
  updateUserRole,
  getAllJobs,
  getAllApplications,
} from "../controllers/adminController";
import { authenticateUser } from "../middlewares/authenticateUser";
import { authorizeAdmin } from "../middlewares/authorizeAdmin";

const router = Router();

router.use(authenticateUser, authorizeAdmin);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/admin/users", getAllUsers);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Update a user's role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [CANDIDATE, HIRING_MANAGER, ADMIN]
 *     responses:
 *       200:
 *         description: User role updated
 */
router.patch("/admin/users/:id/role", updateUserRole);

/**
 * @swagger
 * /admin/jobs:
 *   get:
 *     summary: Get all jobs (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get("/admin/jobs", getAllJobs);

/**
 * @swagger
 * /admin/applications:
 *   get:
 *     summary: Get all applications (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications
 */
router.get("/admin/applications", getAllApplications);

export default router;
