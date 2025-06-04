import { Router } from "express";
import {
  createJob,
  getAllJobs,
  getMyJobs,
  updateJob,
} from "../controllers/jobController";
import { authenticateUser } from "../middlewares/authenticateUser";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();

router.get("/jobs", getAllJobs);
router.post(
  "/jobs",
  authenticateUser,
  authorizeRoles("HIRING_MANAGER"),
  createJob
);
router.get(
  "/manager/jobs",
  authenticateUser,
  authorizeRoles("HIRING_MANAGER"),
  getMyJobs
);
router.patch(
  "/jobs/:id",
  authenticateUser,
  authorizeRoles("HIRING_MANAGER"),
  updateJob
);

export default router;
