import { z } from "zod";
import { PROJECT_PHASES } from "./project.model";
import { PROJECT_PROGRESS_REMARK_STATUSES } from "./projectProgress.model";

export const createProjectSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  technology: z.string().min(2, "Technology is required"),
  projectMembers: z.array(z.coerce.number().int().positive()).default([]),
  preferredGuideId: z.coerce.number().int().positive(),
});

export const manualAssignGuideSchema = z.object({
  guideId: z.coerce.number().int().positive(),
});

export const createProjectProgressSchema = z
  .object({
    phase: z.enum(PROJECT_PHASES),
    progressText: z.string().trim().max(5000).optional().default(""),
    fileBase64: z.string().trim().optional(),
    fileName: z.string().trim().max(255).optional(),
    fileMimeType: z.string().trim().max(255).optional(),
  })
  .superRefine((value, ctx) => {
    const hasText = value.progressText.trim().length > 0;
    const hasFile = Boolean(value.fileBase64);

    if (!hasText && !hasFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide a caption, a file, or both.",
        path: ["progressText"],
      });
    }

    if (hasFile && (!value.fileName || !value.fileMimeType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "File name and MIME type are required when uploading a file.",
        path: ["fileBase64"],
      });
    }
  });

export const reviewProjectProgressSchema = z.object({
  guideReply: z.string().min(2, "Guide reply is required"),
  remarkStatus: z.enum(PROJECT_PROGRESS_REMARK_STATUSES.filter((status) => status !== "pending") as ["needs_changes", "completed"]),
});

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type ManualAssignGuideDto = z.infer<typeof manualAssignGuideSchema>;
export type CreateProjectProgressDto = z.infer<typeof createProjectProgressSchema>;
export type ReviewProjectProgressDto = z.infer<typeof reviewProjectProgressSchema>;
