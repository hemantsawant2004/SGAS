import type { Request, Response, NextFunction } from "express";

export function requireRole(roles: Array<"admin" | "guide" | "student">) {
 
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
     console.log("inside check role",role)
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}
