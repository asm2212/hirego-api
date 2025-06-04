import { Router } from "express";
import { authenticateUser } from "../middlewares/authenticateUser";
import { uploadResume } from "../middlewares/uploadResume";
import { applyToJob } from "../controllers/applicationController";

const router = Router();

router.post(
  "/jobs/:id/apply",
  authenticateUser,
  uploadResume.single("resume"),
  applyToJob
);

export default router;
