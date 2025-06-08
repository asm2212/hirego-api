// ✅ Admin Panel Controllers (with block/suspend + soft delete)
import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { updateUserRoleSchema } from "../validators/adminValidator";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

// ✅ Get all users
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
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
    logger.info(`Admin fetched all users. Count: ${users.length}`);
    res.json({ users });
  } catch (err: any) {
    logger.error(`Admin getAllUsers failed: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch users" });
  }
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

    logger.info(`Admin updated user role: ${id} to ${data.role}`);
    res.json({ message: "Role updated", user: updated });
  } catch (err: any) {
    logger.warn(`Admin updateUserRole failed for user ${id}: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Block or unblock user
export const toggleBlockUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      logger.warn(`Admin tried to block/unblock non-existent user: ${id}`);
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked },
    });

    logger.info(
      `Admin ${updated.isBlocked ? "blocked" : "unblocked"} user: ${id}`
    );
    res.json({
      message: updated.isBlocked ? "User blocked" : "User unblocked",
      user: updated,
    });
  } catch (err: any) {
    logger.error(`Admin toggleBlockUser failed for user ${id}: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Soft delete user
export const softDeleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      logger.warn(`Admin tried to soft delete non-existent user: ${id}`);
      res.status(404).json({ message: "User not found" });
      return;
    }

    await prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    logger.info(`Admin soft deleted user: ${id}`);
    res.json({ message: "User soft deleted" });
  } catch (err: any) {
    logger.error(`Admin softDeleteUser failed for user ${id}: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all jobs (admin)
export const getAllJobs = async (_req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { isDeleted: false },
      include: { manager: true },
      orderBy: { createdAt: "desc" },
    });
    logger.info(`Admin fetched all jobs. Count: ${jobs.length}`);
    res.json({ jobs });
  } catch (err: any) {
    logger.error(`Admin getAllJobs failed: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// ✅ Get all applications (admin)
export const getAllApplications = async (_req: Request, res: Response) => {
  try {
    const applications = await prisma.application.findMany({
      where: { isDeleted: false },
      include: {
        job: true,
        candidate: true,
      },
      orderBy: { createdAt: "desc" },
    });
    logger.info(`Admin fetched all applications. Count: ${applications.length}`);
    res.json({ applications });
  } catch (err: any) {
    logger.error(`Admin getAllApplications failed: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};