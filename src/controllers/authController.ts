import { NextFunction, Request, Response } from "express";
import { loginSchema, signupSchema } from "../validators/authValidator";
import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

function signToken(payload: object, expiresIn = "1h") {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in environment variables.");
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = signupSchema.parse(req.body);

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Only use fields that exist in the schema
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        // role will default to CANDIDATE
      }
    });

    // Generate token
    const token = signToken({ id: user.id, role: user.role });

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
    // Handle validation errors from Zod
    if (error.errors) {
      res.status(400).json({ errors: error.errors });
    } else {
      next(error); // Pass to error handler
    }
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check password
    const match = await bcrypt.compare(data.password, user.password);
    if (!match) {
      res.status(401).json({ message: "Incorrect password" });
      return;
    }

    // Generate token & refresh token
    const token = signToken({ id: user.id, role: user.role });

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
    // Handle validation errors from Zod
    if (err.errors) {
      res.status(400).json({ errors: err.errors });
    } else {
      next(err);
    }
  }
};