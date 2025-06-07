import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// ✅ Add job to favorites
export const favoriteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
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
      res.status(400).json({ message: "Job already favorited" });
      return;
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        jobId,
      },
    });

    res.status(201).json(favorite);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Remove job from favorites
export const unfavoriteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
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

    res.json({ message: "Job unfavorited successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all favorited jobs by the logged-in user
export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: { job: true },
    });

    res.json({ favorites });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
