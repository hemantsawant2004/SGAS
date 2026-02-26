import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  technology: z.string().min(2, "Technology is required"),
  projectMembers: z.array(z.coerce.number().int().positive()).min(1, "At least one member required"),
  preferredGuideId: z.coerce.number().int().positive(),
});

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
