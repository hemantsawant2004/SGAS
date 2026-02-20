import { z } from "zod";
import { givenNameSchema,passwordSchema,roleSchema, usernameSchema } from "../../schemas";


export const CreateUserDto = z.object({
  body: z.object({
    username: usernameSchema,
    given_name: givenNameSchema,
    role: roleSchema.optional(),
  }),
});

export const SignupDto = z.object({
  body: z.object({
    username: usernameSchema,
    password: passwordSchema,
    role: roleSchema.optional(),
  }),
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
