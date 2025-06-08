// ✅ Admin Panel Controllers (with block/suspend + soft delete)
import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { updateUserRoleSchema } from "../validators/adminValidator";

const prisma = new PrismaClient();

// ✅ Get all users
export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBlocked: true,
      createdAt: true,
    },
  });
  res.json({ users });
};

// ✅ Update user role (promote/demote)
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

// ✅ Block or unblock user
export const toggleBlockUser = async (req: Request, res: Response):Promise<void> => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
     res.status(404).json({ message: "User not found" });
     return
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isBlocked: !user.isBlocked },
  });

  res.json({ message: updated.isBlocked ? "User blocked" : "User unblocked", user: updated });
};

// ✅ Soft delete user
export const softDeleteUser = async (req: Request, res: Response):Promise<void> => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
     res.status(404).json({ message: "User not found" });
     return
  }

  await prisma.user.update({
    where: { id },
    data: { isDeleted: true },
  });

  res.json({ message: "User soft deleted" });
};

// ✅ Get all jobs (admin)
export const getAllJobs = async (_req: Request, res: Response) => {
  const jobs = await prisma.job.findMany({
    where: { isDeleted: false },
    include: { manager: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ jobs });
};

// ✅ Get all applications (admin)
export const getAllApplications = async (_req: Request, res: Response) => {
  const applications = await prisma.application.findMany({
    where: { isDeleted: false },
    include: {
      job: true,
      candidate: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ applications });
};
