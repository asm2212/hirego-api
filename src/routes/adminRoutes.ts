import { Router } from "express";
import {
  getAllUsers,
  updateUserRole,
  getAllJobs,
  getAllApplications,
  toggleBlockUser,
  softDeleteUser,
} from "../controllers/adminController";
import { authenticateUser } from "../middlewares/authenticateUser";
import { authorizeAdmin } from "../middlewares/authorizeAdmin";

const router = Router();

router.use(authenticateUser, authorizeAdmin);

// ✅ Get all users
router.get("/admin/users", getAllUsers);

// ✅ Update user role
router.patch("/admin/users/:id/role", updateUserRole);

// ✅ Block or unblock user
/**
 * @swagger
 * /admin/users/{id}/block:
 *   patch:
 *     summary: Toggle block or unblock a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Block status toggled
 *       404:
 *         description: User not found
 */

router.patch("/admin/users/:id/block", toggleBlockUser);

// ✅ Soft delete user
/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Soft delete a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User soft deleted
 *       404:
 *         description: User not found
 */
router.delete("/admin/users/:id", softDeleteUser);

// ✅ Get all jobs
router.get("/admin/jobs", getAllJobs);

// ✅ Get all applications
router.get("/admin/applications", getAllApplications);

export default router;
