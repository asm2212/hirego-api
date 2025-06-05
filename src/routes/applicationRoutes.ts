import { Router } from "express";
import { authenticateUser } from "../middlewares/authenticateUser";
import { uploadResume } from "../middlewares/uploadResume";
import {
  applyToJob,
  deleteApplication,
  downloadResume,
  getMyApplications,
  updateApplicationStatus
} from "../controllers/applicationController";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();

/**
 * @swagger
 * /jobs/{id}/apply:
 *   post:
 *     summary: Apply to a job by uploading a PDF resume
 *     tags: [Candidate]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to apply for
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Application submitted
 */
router.post(
  "/jobs/:id/apply",
  authenticateUser,
  uploadResume.single("resume"),
  applyToJob
);

/**
 * @swagger
 * /user/applications:
 *   get:
 *     summary: Get all applications submitted by the logged-in candidate
 *     tags: [Candidate]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications
 */
router.get(
  "/user/applications",
  authenticateUser,
  authorizeRoles("CANDIDATE"),
  getMyApplications
);

/**
 * @swagger
 * /user/applications/{id}:
 *   delete:
 *     summary: Delete a submitted application
 *     tags: [Candidate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application deleted
 */
router.delete(
  "/user/applications/:id",
  authenticateUser,
  authorizeRoles("CANDIDATE"),
  deleteApplication
);

/**
 * @swagger
 * /user/applications/{id}/resume:
 *   get:
 *     summary: Download resume file for a submitted application
 *     tags: [Candidate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: PDF file download
 */
router.get(
  "/user/applications/:id/resume",
  authenticateUser,
  authorizeRoles("CANDIDATE"),
  downloadResume
);

/**
 * @swagger
 * /admin/applications/{id}/status:
 *   patch:
 *     summary: Update application status (Admin or Hiring Manager)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, REVIEWED, REJECTED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  "/admin/applications/:id/status",
  authenticateUser,
  authorizeRoles("ADMIN", "HIRING_MANAGER"),
  updateApplicationStatus
);

export default router;
