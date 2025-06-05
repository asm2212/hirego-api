import { Request, Response, NextFunction } from "express";

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "ADMIN") {
    res.status(403).json({ message: "Forbidden: Admins only" });
    return;
  }
  next();
};
