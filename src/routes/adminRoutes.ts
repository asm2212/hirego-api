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

router.get("/admin/users", getAllUsers);
router.patch("/admin/users/:id/role", updateUserRole);
router.get("/admin/jobs", getAllJobs);
router.get("/admin/applications", getAllApplications);

export default router;
