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

router.get("/getalls", getAllJobs);
router.post(
  "/create",
  authenticateUser,
  authorizeRoles("HIRING_MANAGER"),
  createJob
);
router.get(
  "/manager/myjobs",
  authenticateUser,
  authorizeRoles("HIRING_MANAGER"),
  getMyJobs
);
router.patch(
  "/updatejob/:id",
  authenticateUser,
  authorizeRoles("HIRING_MANAGER"),
  updateJob
);

export default router;
