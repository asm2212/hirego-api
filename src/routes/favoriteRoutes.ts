// src/routes/favoriteRoutes.ts
import { Router } from "express";
import { authenticateUser } from "../middlewares/authenticateUser";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import {
  favoriteJob,
  unfavoriteJob,
  getFavorites,
} from "../controllers/favoriteController";

const router = Router();

// ✅ Add a job to favorites
router.post(
  "/jobs/:id/favorite",
  authenticateUser,
  authorizeRoles("CANDIDATE"),
  favoriteJob
);

// ✅ Remove a job from favorites
router.delete(
  "/jobs/:id/favorite",
  authenticateUser,
  authorizeRoles("CANDIDATE"),
  unfavoriteJob
);

// ✅ Get all favorited jobs by user
router.get(
  "/user/favorites",
  authenticateUser,
  authorizeRoles("CANDIDATE"),
  getFavorites
);

export default router;
