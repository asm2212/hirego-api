import { NextFunction, Request,Response } from "express";
import { loginSchema, signupSchema } from "../validators/authValidator";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient();

export const signup = async(req:Request,res: Response,next:NextFunction):Promise<void> => {
    try {
        const data = signupSchema.parse(req.body);
        const existing = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        if(existing)
            res.status(409).json({message: "email already exist"});

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { ...data, password: hashedPassword },
    });

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!);
    res.status(201).json({ token });
    } catch (error:any) {
          
          res.status(400).json({ error: error.message });
    }
};


export const login = async (req: Request, res: Response,next:NextFunction):Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ 
        where: { email: data.email } 
    });
    if (!user) 
         res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(data.password, user.password);
    if (!match)
         res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!);
    res.json({ token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};