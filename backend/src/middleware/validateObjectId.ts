import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const validateObjectId = (paramName: string) => (req: Request, res: Response, next: NextFunction) => {
  if (!mongoose.isValidObjectId(req.params[paramName])) {
    res.status(400).json({ message: `Invalid ${paramName}` });
    return;
  }
  next();
};