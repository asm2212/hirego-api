import { Request, Response } from "express";
import { jobSchema } from "../validators/jobValidator";
import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();

export const createJob = async (req: Request, res: Response) => {
  try {
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

export const getAllJobs = async (_: Request, res: Response) => {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });
  res.json(jobs);
};

export const getMyJobs = async (req: Request, res: Response) => {
  const jobs = await prisma.job.findMany({
    where: { managerId: req.user.id },
  });
  res.json(jobs);
};

export const updateJob = async (req: Request, res: Response) => {
  const jobId = req.params.id;

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return res.status(404).json({ message: "Job not found" });

  if (job.managerId !== req.user.id)
    return res.status(403).json({ message: "Not your job" });

  const updateData = req.body; // Partial update
  const updated = await prisma.job.update({
    where: { id: jobId },
    data: updateData,
  });

  res.json(updated);
};
