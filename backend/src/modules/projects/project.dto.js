"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualAssignGuideSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title is required"),
    description: zod_1.z.string().min(10, "Description must be at least 10 characters"),
    technology: zod_1.z.string().min(2, "Technology is required"),
    projectMembers: zod_1.z.array(zod_1.z.coerce.number().int().positive()).default([]),
    preferredGuideId: zod_1.z.coerce.number().int().positive(),
});
exports.manualAssignGuideSchema = zod_1.z.object({
    guideId: zod_1.z.coerce.number().int().positive(),
});
