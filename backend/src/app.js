"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_routes_1 = require("./modules/user/user.routes");
const env_1 = require("./config/env");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.env.WEB_ORIGIN,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET || 'default_secret'));
app.get("/health", (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});
app.use("/api/auth", user_routes_1.authRouter);
app.use("/api/users", user_routes_1.userRouter);
// Error handler
app.use((err, _req, res, _next) => {
    console.error("Error caught:", err);
    res.status(500).json({ message: "Internal server error" });
});
exports.default = app;
