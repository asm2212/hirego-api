import { Router } from "express";
import { authenticateUser } from "../middlewares/authenticateUser";
import { uploadResume } from "../middlewares/uploadResume";
import { applyToJob, getMyApplications } from "../controllers/applicationController";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();

router.post(
  "/jobs/:id/apply",
  authenticateUser,
  uploadResume.single("resume"),
  applyToJob
);

router.get(
  "/user/applications",
  authenticateUser,
  authorizeRoles("CANDIDATE"),
  getMyApplications
);

export default router;
