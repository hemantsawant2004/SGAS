import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import {
  createPreUser,
  findUserById,
  findUserByUsername,
  updateUserPassword,
  updateRefreshToken,
} from "./user.service";
import type {
  CreateUserInput,
  LoginInput,
  SignupInput,
} from "./user.dto";

const jwtSecret: Secret = process.env.JWT_SECRET || "change-me";
const refreshSecret: Secret =
  process.env.JWT_REFRESH_SECRET || "change-me-refresh";
const accessTtl = (process.env.JWT_ACCESS_TTL || "15m") as SignOptions["expiresIn"];
const refreshTtl = (process.env.JWT_REFRESH_TTL || "7d") as SignOptions["expiresIn"];

function ttlToMs(ttl: SignOptions["expiresIn"]) {
  if (typeof ttl === "number") return ttl * 1000;
  if (!ttl) return 7 * 24 * 60 * 60 * 1000;
  const match = /^(\d+)([smhd])?$/.exec(ttl);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2] || "s";
  switch (unit) {
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return value * 1000;
  }
}
// function test(){
//   console.log("test")
// }
function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function signAccessToken(user: { id: number; username: string; role: string }) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    jwtSecret,
    { expiresIn: accessTtl }
  );
}

function signRefreshToken(user: { id: number; username: string; role: string }) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    refreshSecret,
    { expiresIn: refreshTtl }
  );
}

export async function createUser(req: Request, res: Response) {
  const { username, given_name, role } =
    req.body as CreateUserInput;

  const desiredRole = role ?? "student";

  const creatorRole = req.user?.role;

  if (creatorRole === "admin" && desiredRole === "admin") {
    return res
      .status(403)
      .json({ message: "Admin cannot create another admin" });
  }

  const existing = await findUserByUsername(username);
  if (existing) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const user = await createPreUser({
    username,
    given_name,
    role: desiredRole,
  });

  return res.status(201).json({
    id: user.id,
    username: user.username,
    given_name: user.given_name,
    role: user.role,
  });
}


export async function signup(req: Request, res: Response) {
  const { username, password } = req.body as SignupInput;

  const hashed = await bcrypt.hash(password, 10);
  const user = await findUserByUsername(username);

  if (!user) {
    const created = await createPreUser({
      username,
      given_name: username,
      role: "student",
    });
    await updateUserPassword(created.id, hashed);
    return res.status(201).json({ message: "Signup completed" });
  }

  if (user.password) {
    return res.status(409).json({ message: "User already registered" });
  }

  await updateUserPassword(user.id, hashed);

  return res.json({ message: "Signup completed" });
}

export async function login(req: Request, res: Response) {
  console.log("inside loginnn", req.body)
  const { username, password } = req.body as LoginInput;

  const user = await findUserByUsername(username);
  console.log("user listt", user)
  if (!user || !user.password) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const refreshExpiresAt = new Date(Date.now() + ttlToMs(refreshTtl));
  await updateRefreshToken(user.id, hashToken(refreshToken), refreshExpiresAt);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Backward compatibility for older clients using "token"
  // res.cookie("token", accessToken, {
  //   httpOnly: true,
  //   sameSite: "lax",
  //   secure: process.env.NODE_ENV === "production",
  //   maxAge: 15 * 60 * 1000,
  // });

  return res.json({
    id: user.id.toString(),
    username: user.username,
    fullName: user.given_name,
    role: user.role,
  });
}

export async function logout(req: Request, res: Response) {
  console.log("inside logout user", req.user)
  if (req.user?.id) {
    await updateRefreshToken(req.user.id, null, null);
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.json({ message: "Logged out" });
}

export async function me(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  return res.json(req.user);
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  try {
    const payload = jwt.verify(token, refreshSecret) as {
      id: number;
      username: string;
      role: string;
    };

    const user = await findUserById(payload.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (!user.refresh_token_hash || !user.refresh_token_expires_at) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    if (user.refresh_token_expires_at.getTime() < Date.now()) {
      await updateRefreshToken(user.id, null, null);
      return res.status(401).json({ message: "Refresh token expired" });
    }

    const incomingHash = hashToken(token);
    if (incomingHash !== user.refresh_token_hash) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    const refreshExpiresAt = new Date(Date.now() + ttlToMs(refreshTtl));
    await updateRefreshToken(user.id, hashToken(refreshToken), refreshExpiresAt);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      id: user.id,
      username: user.username,
      given_name: user.given_name,
      role: user.role,
    });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}
