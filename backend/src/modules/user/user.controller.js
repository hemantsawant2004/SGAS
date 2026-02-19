"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.signup = signup;
exports.login = login;
exports.logout = logout;
exports.me = me;
exports.refresh = refresh;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_service_1 = require("./user.service");
const jwtSecret = process.env.JWT_SECRET || "change-me";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "change-me-refresh";
const accessTtl = (process.env.JWT_ACCESS_TTL || "15m");
const refreshTtl = (process.env.JWT_REFRESH_TTL || "7d");
function ttlToMs(ttl) {
    if (typeof ttl === "number")
        return ttl * 1000;
    if (!ttl)
        return 7 * 24 * 60 * 60 * 1000;
    const match = /^(\d+)([smhd])?$/.exec(ttl);
    if (!match)
        return 7 * 24 * 60 * 60 * 1000;
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
function hashToken(token) {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
}
function signAccessToken(user) {
    return jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: accessTtl });
}
function signRefreshToken(user) {
    return jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, refreshSecret, { expiresIn: refreshTtl });
}
async function createUser(req, res) {
    const { username, given_name, role } = req.body;
    const desiredRole = role ?? "student";
    const creatorRole = req.user?.role;
    if (creatorRole === "admin" && desiredRole === "admin") {
        return res
            .status(403)
            .json({ message: "Admin cannot create another admin" });
    }
    const existing = await (0, user_service_1.findUserByUsername)(username);
    if (existing) {
        return res.status(409).json({ message: "Username already exists" });
    }
    const user = await (0, user_service_1.createPreUser)({
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
async function signup(req, res) {
    const { username, password, role } = req.body;
    const desiredRole = role ?? "student";
    if (desiredRole === "admin") {
        return res.status(403).json({ message: "Admin signup is not allowed" });
    }
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const user = await (0, user_service_1.findUserByUsername)(username);
    if (!user) {
        const created = await (0, user_service_1.createPreUser)({
            username,
            given_name: username,
            role: desiredRole,
        });
        await (0, user_service_1.updateUserPassword)(created.id, hashed);
        return res.status(201).json({ message: "Signup completed" });
    }
    if (user.password) {
        return res.status(409).json({ message: "User already registered" });
    }
    await (0, user_service_1.updateUserPassword)(user.id, hashed);
    return res.json({ message: "Signup completed" });
}
async function login(req, res) {
    console.log("inside loginnn", req.body);
    const { username, password } = req.body;
    const user = await (0, user_service_1.findUserByUsername)(username);
    console.log("user listt", user);
    if (!user || !user.password) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const ok = await bcryptjs_1.default.compare(password, user.password);
    if (!ok) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    const refreshExpiresAt = new Date(Date.now() + ttlToMs(refreshTtl));
    await (0, user_service_1.updateRefreshToken)(user.id, hashToken(refreshToken), refreshExpiresAt);
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
async function logout(req, res) {
    console.log("inside logout user", req.user);
    if (req.user?.id) {
        await (0, user_service_1.updateRefreshToken)(req.user.id, null, null);
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.json({ message: "Logged out" });
}
async function me(req, res) {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    return res.json(req.user);
}
async function refresh(req, res) {
    const token = req.cookies?.refreshToken;
    if (!token) {
        return res.status(401).json({ message: "Missing refresh token" });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, refreshSecret);
        const user = await (0, user_service_1.findUserById)(payload.id);
        if (!user) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }
        if (!user.refresh_token_hash || !user.refresh_token_expires_at) {
            return res.status(401).json({ message: "Refresh token revoked" });
        }
        if (user.refresh_token_expires_at.getTime() < Date.now()) {
            await (0, user_service_1.updateRefreshToken)(user.id, null, null);
            return res.status(401).json({ message: "Refresh token expired" });
        }
        const incomingHash = hashToken(token);
        if (incomingHash !== user.refresh_token_hash) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }
        const accessToken = signAccessToken(user);
        const refreshToken = signRefreshToken(user);
        const refreshExpiresAt = new Date(Date.now() + ttlToMs(refreshTtl));
        await (0, user_service_1.updateRefreshToken)(user.id, hashToken(refreshToken), refreshExpiresAt);
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
    }
    catch {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
}
