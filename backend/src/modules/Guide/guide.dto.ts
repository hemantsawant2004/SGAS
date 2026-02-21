import { z } from "zod";

export const createGuideSchema = z.object({
  fullName: z.string().min(1,"fullname is required"),
  email: z.string()
  .email("Invalid email format")
  .refine((email) => email.endsWith("@gmail.com"), 
  {message: "Only Gmail accounts are allowed",}),  
  phone: z
  .string()
  .min(10, "Phone number must be 10 digits")
  .max(10, "Phone number must be 10 digits")
  .regex(/^\d+$/, "Phone number must contain only digits"),  
  linkedin: z.string().optional(),
  bio: z.string().min(10,"bio is required"),
  departmentName: z.string().min(2,"department name is required"),
  qualification: z.string().min(2,"qualification is required"),
  experience: z.number().min(0,"experience is required"),
  expertise: z.array(z.string()).min(1),
});

export type CreateGuideDto = z.infer<typeof createGuideSchema>;