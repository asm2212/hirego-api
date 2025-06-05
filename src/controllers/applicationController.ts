import { Request, Response } from "express";
import { PrismaClient, ApplicationStatus } from "../generated/prisma";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const RESUME_DIR = path.join(__dirname, "../../uploads/resumes");

/**
 * Candidate applies to a job with a PDF resume
 */
export const applyToJob = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "CANDIDATE") {
      res.status(403).json({ message: "Only candidates can apply" });
      return;
    }

    const jobId = req.params.id;
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    if (new Date() > job.deadline) {
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
      res.status(403).json({ message: "You already applied to this job" });
      return;
    }

    if (!req.file) {
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

      res.status(201).json({ message: "Application submitted successfully", application });
    } catch (err: any) {
      if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath); // cleanup if DB insert fails
      throw err;
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to apply to job" });
  }
};

/**
 * Candidate views all jobs they applied to
 */
export const getMyApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "CANDIDATE") {
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

    res.json({ applications });
  } catch (err: any) {
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
      res.status(404).json({ message: "Application not found or unauthorized" });
      return;
    }

    if (fs.existsSync(app.resumePath)) {
      fs.unlinkSync(app.resumePath);
    }

    await prisma.application.delete({ where: { id } });
    res.json({ message: "Application deleted successfully" });
  } catch (err: any) {
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
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status: status as ApplicationStatus },
    });

    res.json({ message: "Status updated", application: updated });
  } catch (err: any) {
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
      res.status(404).json({ message: "Application not found or unauthorized" });
      return;
    }

    const filePath = path.resolve(app.resumePath);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "Resume file not found" });
      return;
    }

    res.download(filePath);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
