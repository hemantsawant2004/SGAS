import type { Request } from "express";

export type AuthUser = {
  id: number;
  username: string;
  role: "admin" | "guide" | "student";
};

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export {};
