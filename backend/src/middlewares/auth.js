"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const jwtSecret = env_1.env.JWT_SECRET || "change-me";
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    const bearer = header && header.startsWith("Bearer ") ? header.slice(7) : null;
    console.log("bearer", bearer);
    const token = bearer || req.cookies?.accessToken || req.cookies?.token;
    console.log("token kedarrrr", token);
    if (!token) {
        console.log("inside not authorised", token);
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        console.log("inside jwt secret", jwtSecret);
        const payload = jsonwebtoken_1.default.verify(token, jwtSecret);
        console.log("payload", payload);
        req.user = payload;
        return next();
    }
    catch (error) {
        console.log("Inside catch user", error);
        return res.status(401).json({ message: "Invalid token" });
    }
}
