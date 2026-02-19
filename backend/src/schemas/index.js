"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordSchema = exports.roleSchema = exports.givenNameSchema = exports.usernameSchema = void 0;
const zod_1 = require("zod");
exports.usernameSchema = zod_1.z.string().min(3).max(50);
exports.givenNameSchema = zod_1.z.string().min(2).max(100);
exports.roleSchema = zod_1.z.enum(["admin", "guide", "student"]);
exports.passwordSchema = zod_1.z.string().min(6).max(100);
