import { Router } from "express";
import { authenticateUser } from "../middlewares/authenticateUser";
import { uploadResume } from "../middlewares/uploadResume";
import { applyToJob, deleteApplication, downloadResume, getMyApplications, updateApplicationStatus } from "../controllers/applicationController";
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
router.delete(
  "/user/applications/:id",
   authenticateUser, 
   authorizeRoles("CANDIDATE"), 
   deleteApplication);
router.get(
  "/user/applications/:id/resume",
   authenticateUser,
    authorizeRoles("CANDIDATE"), 
    downloadResume);
router.patch(
  "/admin/applications/:id/status",
   authenticateUser, 
   authorizeRoles("ADMIN", "HIRING_MANAGER"), 
   updateApplicationStatus);

export default router;
