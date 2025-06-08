import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

// ✅ Add job to favorites
export const favoriteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      logger.warn("Unauthorized favoriteJob attempt");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const jobId = req.params.id;

    const exists = await prisma.favorite.findUnique({
      where: {
        userId_jobId: {
          userId: req.user.id,
          jobId,
        },
      },
    });

    if (exists) {
      logger.info(`User ${req.user.id} tried to favorite job ${jobId} which is already favorited`);
      res.status(400).json({ message: "Job already favorited" });
      return;
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        jobId,
      },
    });

    logger.info(`User ${req.user.id} favorited job ${jobId}`);
    res.status(201).json(favorite);
  } catch (err: any) {
    logger.error(`favoriteJob failed for user ${req.user?.id ?? "unknown"}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Remove job from favorites
export const unfavoriteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      logger.warn("Unauthorized unfavoriteJob attempt");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const jobId = req.params.id;

    await prisma.favorite.delete({
      where: {
        userId_jobId: {
          userId: req.user.id,
          jobId,
        },
      },
    });

    logger.info(`User ${req.user.id} unfavorited job ${jobId}`);
    res.json({ message: "Job unfavorited successfully" });
  } catch (err: any) {
    logger.error(`unfavoriteJob failed for user ${req.user?.id ?? "unknown"}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all favorited jobs by the logged-in user
export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      logger.warn("Unauthorized getFavorites attempt");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: { job: true },
    });

    logger.info(`User ${req.user.id} fetched their favorite jobs (count: ${favorites.length})`);
    res.json({ favorites });
  } catch (err: any) {
    logger.error(`getFavorites failed for user ${req.user?.id ?? "unknown"}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};