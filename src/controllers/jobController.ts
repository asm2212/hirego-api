import { Request, Response } from "express";
import { jobSchema } from "../validators/jobValidator";
import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();

export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data = jobSchema.parse(req.body);
    const job = await prisma.job.create({
      data: {
        ...data,
        deadline: new Date(data.deadline),
        managerId: req.user.id,
      },
    });

    res.status(201).json(job);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllJobs = async (_: Request, res: Response): Promise<void> => {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(jobs);
};

export const getMyJobs = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const jobs = await prisma.job.findMany({
    where: { managerId: req.user.id },
  });

  res.json(jobs);
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const jobId = req.params.id;
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) {
    res.status(404).json({ message: "Job not found" });
    return;
  }

  if (job.managerId !== req.user.id) {
    res.status(403).json({ message: "Not your job" });
    return;
  }

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: req.body, // ⚠️ Consider validating this with Zod or restricting updatable fields
  });

  res.json(updated);
};
