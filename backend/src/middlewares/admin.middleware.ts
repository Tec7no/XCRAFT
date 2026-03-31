import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    console.log("ADMIN CHECK - userId:", userId);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    console.log("ADMIN CHECK - user found:", user?.email, "role:", user?.role);
    
    if (!user || !['admin', 'manager'].includes(user.role)) {
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }

    (req as any).adminUser = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};