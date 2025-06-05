import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { updateUserRoleSchema } from "../validators/adminValidator";

const prisma = new PrismaClient();
/**
 * GET /admin/users
 */
export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  res.json({ users });
};

/**
 * PATCH /admin/users/:id/role
 */
export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const data = updateUserRoleSchema.parse(req.body);

    const updated = await prisma.user.update({
      where: { id },
      data: { role: data.role },
    });

    res.json({ message: "Role updated", user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /admin/jobs
 */
export const getAllJobs = async (_req: Request, res: Response) => {
  const jobs = await prisma.job.findMany({
    include: { manager: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ jobs });
};

/**
 * GET /admin/applications
 */
export const getAllApplications = async (_req: Request, res: Response) => {
  const applications = await prisma.application.findMany({
    include: {
      job: true,
      candidate: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ applications });
};
