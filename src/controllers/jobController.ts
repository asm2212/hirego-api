import { Request, Response } from "express";
import { jobSchema } from "../validators/jobValidator";
import { PrismaClient } from "../generated/prisma";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

// ✅ Create a new job (Hiring Manager)
export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      logger.warn("Unauthorized createJob attempt");
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

    logger.info(`Job created: ${job.id} by user ${req.user.id}`);
    res.status(201).json(job);
  } catch (err: any) {
    logger.error(`Job creation failed: ${err.message}`);
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

  try {
    const jobs = await prisma.job.findMany({
      where: filters,
      skip,
      take: pageSize,
      orderBy: {
        [sortBy as string]: order === "asc" ? "asc" : "desc",
      },
    });

    const total = await prisma.job.count({ where: filters });

    logger.info(
      `getAllJobs: returned ${jobs.length} jobs (page ${pageNumber})`
    );

    res.json({
      total,
      page: pageNumber,
      limit: pageSize,
      jobs,
    });
  } catch (err: any) {
    logger.error(`getAllJobs failed: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// ✅ Get all jobs created by logged-in Hiring Manager
export const getMyJobs = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    logger.warn("Unauthorized getMyJobs attempt");
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const jobs = await prisma.job.findMany({
      where: { managerId: req.user.id },
    });

    logger.info(`getMyJobs: user ${req.user.id} returned ${jobs.length} jobs`);
    res.json(jobs);
  } catch (err: any) {
    logger.error(`getMyJobs failed for user ${req.user.id}: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch your jobs" });
  }
};

// ✅ Update job (only by owner)
export const updateJob = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    logger.warn("Unauthorized updateJob attempt");
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const jobId = req.params.id;
  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      logger.warn(`updateJob: Job ${jobId} not found`);
      res.status(404).json({ message: "Job not found" });
      return;
    }

    if (job.managerId !== req.user.id) {
      logger.warn(
        `updateJob: User ${req.user.id} tried to update job ${jobId} not owned by them`
      );
      res.status(403).json({ message: "Not your job" });
      return;
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: req.body, // ✅ status allowed (OPEN/CLOSED)
    });

    logger.info(`Job updated: ${jobId} by user ${req.user.id}`);
    res.json(updated);
  } catch (err: any) {
    logger.error(`updateJob failed for job ${jobId}: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete job (only by owner)
export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    logger.warn("Unauthorized deleteJob attempt");
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const jobId = req.params.id;
  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      logger.warn(`deleteJob: Job ${jobId} not found`);
      res.status(404).json({ message: "Job not found" });
      return;
    }

    if (job.managerId !== req.user.id) {
      logger.warn(
        `deleteJob: User ${req.user.id} tried to delete job ${jobId} not owned by them`
      );
      res.status(403).json({ message: "You are not the owner of this job" });
      return;
    }

    await prisma.job.delete({ where: { id: jobId } });

    logger.info(`Job deleted: ${jobId} by user ${req.user.id}`);
    res.json({ message: "Job deleted successfully" });
  } catch (err: any) {
    logger.error(`deleteJob failed for job ${jobId}: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};