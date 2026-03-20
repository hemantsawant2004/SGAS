"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewProjectProgressSchema = exports.createProjectProgressSchema = exports.manualAssignGuideSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
const project_model_1 = require("./project.model");
const projectProgress_model_1 = require("./projectProgress.model");
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
exports.createProjectProgressSchema = zod_1.z
    .object({
    phase: zod_1.z.enum(project_model_1.PROJECT_PHASES),
    progressText: zod_1.z.string().trim().max(5000).optional().default(""),
    fileBase64: zod_1.z.string().trim().optional(),
    fileName: zod_1.z.string().trim().max(255).optional(),
    fileMimeType: zod_1.z.string().trim().max(255).optional(),
})
    .superRefine((value, ctx) => {
    const hasText = value.progressText.trim().length > 0;
    const hasFile = Boolean(value.fileBase64);
    if (!hasText && !hasFile) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Provide a caption, a file, or both.",
            path: ["progressText"],
        });
    }
    if (hasFile && (!value.fileName || !value.fileMimeType)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "File name and MIME type are required when uploading a file.",
            path: ["fileBase64"],
        });
    }
});
exports.reviewProjectProgressSchema = zod_1.z.object({
    guideReply: zod_1.z.string().min(2, "Guide reply is required"),
    remarkStatus: zod_1.z.enum(projectProgress_model_1.PROJECT_PROGRESS_REMARK_STATUSES.filter((status) => status !== "pending")),
});
