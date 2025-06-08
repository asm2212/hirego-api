import { NextFunction, Request, Response } from "express";
import { loginSchema, signupSchema } from "../validators/authValidator";
import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger"; // ✅ import logger

const prisma = new PrismaClient();

function signToken(payload: object, expiresIn = "1h") {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in environment variables.");
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

// ✅ Signup Controller
export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = signupSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      logger.warn(`Signup failed: email ${data.email} already exists`);
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      }
    });

    const token = signToken({ id: user.id, role: user.role });

    logger.info(`User signed up: ${user.email} (${user.role})`);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      }
    });

  } catch (error: any) {
    if (error.errors) {
      logger.warn(`Signup validation error: ${JSON.stringify(error.errors)}`);
      res.status(400).json({ errors: error.errors });
    } else {
      logger.error(`Signup server error: ${error.message}`);
      next(error);
    }
  }
};

// ✅ Login Controller
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      logger.warn(`Login failed: user ${data.email} not found`);
      res.status(404).json({ message: "User not found" });
      return;
    }

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) {
      logger.warn(`Login failed: incorrect password for ${data.email}`);
      res.status(401).json({ message: "Incorrect password" });
      return;
    }

    const token = signToken({ id: user.id, role: user.role });

    logger.info(`User logged in: ${user.email} (${user.role})`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      }
    });
  } catch (err: any) {
    if (err.errors) {
      logger.warn(`Login validation error: ${JSON.stringify(err.errors)}`);
      res.status(400).json({ errors: err.errors });
    } else {
      logger.error(`Login server error: ${err.message}`);
      next(err);
    }
  }
};
