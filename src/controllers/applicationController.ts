import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

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

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: req.user.id,
        resumePath: req.file.path,
      },
    });

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
