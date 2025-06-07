import { Request, Response } from "express";
import { jobSchema } from "../validators/jobValidator";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// ✅ Create a new job (Hiring Manager)
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
        status: data.status || "OPEN", // default OPEN
      },
    });

    res.status(201).json(job);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Public: Get all jobs with filters, sorting, pagination
export const getAllJobs = async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    order = "desc",
    jobType,
    location,
    companyName,
  } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * pageSize;

  const filters: any = {
    deadline: {
      gte: new Date(), // Only future jobs
    },
    status: "OPEN",
  };

  if (jobType) filters.jobType = jobType;
  if (location) filters.location = location;
  if (companyName) filters.companyName = companyName;

  const jobs = await prisma.job.findMany({
    where: filters,
    skip,
    take: pageSize,
    orderBy: {
      [sortBy as string]: order === "asc" ? "asc" : "desc",
    },
  });

  const total = await prisma.job.count({ where: filters });

  res.json({
    total,
    page: pageNumber,
    limit: pageSize,
    jobs,
  });
};

// ✅ Get all jobs created by logged-in Hiring Manager
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

// ✅ Update job (only by owner)
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
    data: req.body, // ✅ status allowed (OPEN/CLOSED)
  });

  res.json(updated);
};

// ✅ Delete job (only by owner)
export const deleteJob = async (req: Request, res: Response): Promise<void> => {
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
    res.status(403).json({ message: "You are not the owner of this job" });
    return;
  }

  await prisma.job.delete({ where: { id: jobId } });

  res.json({ message: "Job deleted successfully" });
};
