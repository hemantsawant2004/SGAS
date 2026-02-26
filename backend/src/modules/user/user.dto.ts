import { z } from "zod";
import { givenNameSchema, passwordSchema, roleSchema, usernameSchema } from "../../schemas";

const studentAcademicFields = {
  class: z.string().optional(),
  division: z.string().optional(),
  rollNumber: z.string().optional(),
};

const enforceStudentAcademicFields = (
  data: { role?: "admin" | "guide" | "student"; class?: string; division?: string; rollNumber?: string },
  ctx: z.RefinementCtx
) => {
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
};

export const CreateUserDto = z.object({
  body: z
    .object({
      username: usernameSchema,
      given_name: givenNameSchema,
      role: roleSchema.optional(),
      ...studentAcademicFields,
    })
    .superRefine(enforceStudentAcademicFields),
});

export const SignupDto = z.object({
  body: z
    .object({
      username: usernameSchema,
      password: passwordSchema,
      role: roleSchema.optional(),
      ...studentAcademicFields,
    })
    .superRefine(enforceStudentAcademicFields),
});

export const LoginDto = z.object({
  body: z.object({
    username: usernameSchema,
    password: passwordSchema,
  }),
});

export type CreateUserInput = z.infer<typeof CreateUserDto>["body"];
export type SignupInput = z.infer<typeof SignupDto>["body"];
export type LoginInput = z.infer<typeof LoginDto>["body"];
