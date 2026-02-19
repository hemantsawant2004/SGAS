import { z } from 'zod';

export const LoginRequest = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6),
});

export type LoginRequestType = z.infer<typeof LoginRequest>;

export const SignupRequest = z
  .object({
    username: z.string().min(3, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["student", "guide"], {
      message: "Role is required",
    }),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],

    
  });

export type SignupRequestType = z.infer<typeof SignupRequest>;

export const SessionUser = z.object({
  id: z.string(),
  fullName: z.string(),
  username: z.string(),
  // mobileNumber:z.string(),
 // role:z.enum(['ADMIN', 'SUPERADMIN']),
  role:z.string(),
});
export type SessionUser = z.infer<typeof SessionUser>;
