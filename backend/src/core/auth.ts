import type { RequestHandler } from "express";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/requireRole";

export const auth = (): RequestHandler => requireAuth;

export const checkAdmin: RequestHandler = requireRole(["admin"]);
export const checkGuide: RequestHandler = requireRole(["guide"]);
export const checkStudent: RequestHandler = requireRole(["student"]);