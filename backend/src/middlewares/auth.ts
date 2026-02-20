import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../types/express";
import { env } from "../config/env";

const jwtSecret = env.JWT_SECRET || "change-me";

export function requireAuth(req: Request, res: Response, next: NextFunction) {

  const header = req.headers.authorization;
  const bearer = header && header.startsWith("Bearer ") ? header.slice(7) : null;
  console.log("bearer",bearer)
  const token =
    bearer || req.cookies?.accessToken || req.cookies?.token;
  console.log("token kedarrrr",token)
  if (!token) {
    console.log("inside not authorised",token)
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    console.log("inside jwt secret",jwtSecret)
    const payload = jwt.verify(token, jwtSecret) as AuthUser;
    console.log("payload",payload)
    req.user = payload;
    return next();
  } catch(error) {
    console.log("Inside catch user",error)

    return res.status(401).json({ message: "Invalid token" });
  }
}
