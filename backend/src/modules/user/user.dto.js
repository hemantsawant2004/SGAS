"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginDto = exports.SignupDto = exports.CreateUserDto = void 0;
const zod_1 = require("zod");
const schemas_1 = require("../../schemas");
const studentAcademicFields = {
    class: zod_1.z.string().optional(),
    division: zod_1.z.string().optional(),
    rollNumber: zod_1.z.string().optional(),
};
const enforceStudentAcademicFields = (data, ctx) => {
    if (data.role === "student") {
        if (!data.class) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Class is required for students",
                path: ["class"],
            });
        }
        if (!data.division) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Division is required for students",
                path: ["division"],
            });
        }
        if (!data.rollNumber) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Roll Number is required for students",
                path: ["rollNumber"],
            });
        }
    }
};
exports.CreateUserDto = zod_1.z.object({
    body: zod_1.z
        .object({
        username: schemas_1.usernameSchema,
        given_name: schemas_1.givenNameSchema,
        role: schemas_1.roleSchema.optional(),
        ...studentAcademicFields,
    })
        .superRefine(enforceStudentAcademicFields),
});
exports.SignupDto = zod_1.z.object({
    body: zod_1.z
        .object({
        username: schemas_1.usernameSchema,
        password: schemas_1.passwordSchema,
        role: schemas_1.roleSchema.optional(),
        ...studentAcademicFields,
    })
        .superRefine(enforceStudentAcademicFields),
});
exports.LoginDto = zod_1.z.object({
    body: zod_1.z.object({
        username: schemas_1.usernameSchema,
        password: schemas_1.passwordSchema,
    }),
});
