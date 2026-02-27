import { z } from 'zod';

export const LoginRequest = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6),
});
export type LoginRequestType = z.infer<typeof LoginRequest>;

export const SignupRequest = z
  .object({
    username: z.string().min(3, "Username must be more than 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["student", "guide"], {
      message: "Role is required",
    }),
    class: z.string().optional(),
    division: z.string().optional(),
    rollNumber: z.string().optional(),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }

    if (data.role === "student") {
      if (!data.class) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Class is required for students",
          path: ["class"],
        });
      }

      if (!data.division) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Division is required for students",
          path: ["division"],
        });
      }

      if (!data.rollNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Roll Number is required for students",
          path: ["rollNumber"],
        });
      }
    }
  });

export type SignupRequestType = z.infer<typeof SignupRequest>;

export const SessionUser = z.object({
  id: z.string(),
  fullName: z.string(),
  username: z.string(),
  // mobileNumber:z.string(),
  // role:z.enum(['ADMIN', 'SUPERADMIN']),
  role: z.string(),
});
export type SessionUser = z.infer<typeof SessionUser>;
