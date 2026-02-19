import { z } from "zod";

export const usernameSchema = z.string().min(3).max(50);
export const givenNameSchema = z.string().min(2).max(100);
export const roleSchema = z.enum(["admin", "guide", "student"]);
export const passwordSchema = z.string().min(6).max(100);

