import { Request, Response } from "express";
import { PrismaClient, ApplicationStatus } from "../generated/prisma";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();
const RESUME_DIR = path.join(__dirname, "../../uploads/resumes");

/**
 * Candidate applies to a job with a PDF resume
 */
export const applyToJob = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "CANDIDATE") {
      logger.warn(`Unauthorized application attempt by user ${req.user?.id ?? "unknown"}`);
      res.status(403).json({ message: "Only candidates can apply" });
      return;
    }

    const jobId = req.params.id;
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      logger.warn(`Job not found for apply, id: ${jobId}`);
      res.status(404).json({ message: "Job not found" });
      return;
    }

    if (new Date() > job.deadline) {
      logger.warn(`Application deadline passed for job ${jobId}, candidate: ${req.user.id}`);
      res.status(410).json({ message: "Job application deadline has passed" });
      return;
    }

    const existing = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: req.user.id,
        },
      },
    });

    if (existing) {
      logger.warn(`Duplicate application: user ${req.user.id} already applied to job ${jobId}`);
      res.status(403).json({ message: "You already applied to this job" });
      return;
    }

    if (!req.file) {
      logger.warn(`No resume file provided by user ${req.user.id} for job ${jobId}`);
      res.status(400).json({ message: "Resume file is required (PDF)" });
      return;
    }

    const resumePath = req.file.path;

    try {
      const application = await prisma.application.create({
        data: {
          jobId,
          candidateId: req.user.id,
          resumePath,
        },
      });

      logger.info(`Application submitted by user ${req.user.id} for job ${jobId} (application id: ${application.id})`);
      res.status(201).json({ message: "Application submitted successfully", application });
    } catch (err: any) {
      if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath); // cleanup if DB insert fails
      logger.error(`Failed to save application for user ${req.user.id} and job ${jobId}: ${err.message}`);
      throw err;
    }
  } catch (err: any) {
    logger.error(`applyToJob failed: ${err.message}`);
    res.status(500).json({ error: err.message || "Failed to apply to job" });
  }
};

/**
 * Candidate views all jobs they applied to
 */
export const getMyApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "CANDIDATE") {
      logger.warn(`Unauthorized getMyApplications attempt by user ${req.user?.id ?? "unknown"}`);
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { candidateId: req.user.id },
      include: {
        job: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    logger.info(`User ${req.user.id} fetched their applications: count ${applications.length}`);
    res.json({ applications });
  } catch (err: any) {
    logger.error(`getMyApplications failed for user ${req.user?.id ?? "unknown"}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Candidate deletes an application and its resume
 */
export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;

    const app = await prisma.application.findUnique({ where: { id } });
    if (!app || app.candidateId !== req.user?.id) {
      logger.warn(`Unauthorized or not found delete attempt for application ${id} by user ${req.user?.id ?? "unknown"}`);
      res.status(404).json({ message: "Application not found or unauthorized" });
      return;
    }

    if (fs.existsSync(app.resumePath)) {
      fs.unlinkSync(app.resumePath);
      logger.info(`Resume file deleted for application ${id} by user ${req.user.id}`);
    }

    await prisma.application.delete({ where: { id } });
    logger.info(`Application ${id} deleted by user ${req.user.id}`);
    res.json({ message: "Application deleted successfully" });
  } catch (err: any) {
    logger.error(`deleteApplication failed for user ${req.user?.id ?? "unknown"}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin or Hiring Manager updates application status
 */
export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "REVIEWED", "REJECTED"].includes(status)) {
      logger.warn(`Invalid status "${status}" for application ${id} update`);
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status: status as ApplicationStatus },
    });

    logger.info(`Application ${id} status updated to ${status} by user ${req.user?.id ?? "unknown"}`);
    res.json({ message: "Status updated", application: updated });
  } catch (err: any) {
    logger.error(`updateApplicationStatus failed for application ${req.params.id}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Candidate downloads their resume for an application
 */
export const downloadResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const app = await prisma.application.findUnique({ where: { id } });

    if (!app || app.candidateId !== req.user?.id) {
      logger.warn(`Unauthorized download attempt for application ${id} by user ${req.user?.id ?? "unknown"}`);
      res.status(404).json({ message: "Application not found or unauthorized" });
      return;
    }

    const filePath = path.resolve(app.resumePath);
    if (!fs.existsSync(filePath)) {
      logger.warn(`Resume file not found for application ${id} (user: ${req.user.id})`);
      res.status(404).json({ message: "Resume file not found" });
      return;
    }

    logger.info(`Resume downloaded for application ${id} by user ${req.user.id}`);
    res.download(filePath);
  } catch (err: any) {
    logger.error(`downloadResume failed for user ${req.user?.id ?? "unknown"}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};