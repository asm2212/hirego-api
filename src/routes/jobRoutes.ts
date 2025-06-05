import { Router } from "express";
import {
  createJob,
  getAllJobs,
  getMyJobs,
  updateJob,
} from "../controllers/jobController";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { authenticateUser } from "../middlewares/authenticateUser";

const router = Router();

/**
 * @swagger
 * job/getalls:
 *   get:
 *     summary: Get all job listings (public)
 *     tags: [Candidate]
 *     responses:
 *       200:
 *         description: List of public jobs
 */
router.get("/getalls", getAllJobs);

/**
 * @swagger
 * job/create:
 *   post:
 *     summary: Hiring Manager creates a new job
 *     tags: [HiringManager]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - jobType
 *               - location
 *               - salary
 *               - deadline
 *               - companyName
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               jobType:
 *                 type: string
 *               location:
 *                 type: string
 *               salary:
 *                 type: integer
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               companyName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 */
router.post(
  "/create",
  authenticateUser,
  authorizeRoles("HIRING_MANAGER"),
  createJob
);

/**
 * @swagger
 * job/manager/myjobs:
 *   get:
 *     summary: Hiring Manager gets their own posted jobs
 *     tags: [HiringManager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of own jobs
 */
router.get(
  "/manager/myjobs",
  authenticateUser,
  authorizeRoles("HIRING_MANAGER"),
  getMyJobs
);

/**
 * @swagger
 * job/updatejob/{id}:
 *   patch:
 *     summary: Hiring Manager updates a job they created
 *     tags: [HiringManager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               salary: { type: number }
 *               location: { type: string }
 *               jobType: { type: string }
 *               deadline: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Job updated
 */
router.patch(
  "/updatejob/:id",
  authenticateUser,
  authorizeRoles("HIRING_MANAGER"),
  updateJob
);

export default router;
