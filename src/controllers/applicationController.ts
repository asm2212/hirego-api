import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import fs from "fs";

const prisma = new PrismaClient();

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

    try {
      const application = await prisma.application.create({
        data: {
          jobId,
          candidateId: req.user.id,
          resumePath: req.file.path,
        },
      });

      res.status(201).json({ message: "Application submitted successfully", application });
    } catch (err: any) {
      // Cleanup uploaded file if DB save fails
      if (req.file) fs.unlinkSync(req.file.path);
      throw err;
    }
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to apply to job" });
  }
};

/**
 * Candidate views all jobs they applied to
 */
export const getMyApplications = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== "CANDIDATE") {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  const applications = await prisma.application.findMany({
    where: { candidateId: req.user.id },
    include: {
      job: true, // Include job info for context
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({ applications });
};
