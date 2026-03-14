"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGuideSchema = void 0;
const zod_1 = require("zod");
exports.createGuideSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "fullname is required"),
    email: zod_1.z.string()
        .email("Invalid email format")
        .refine((email) => email.endsWith("@gmail.com"), { message: "Only Gmail accounts are allowed", }),
    phone: zod_1.z
        .string()
        .min(10, "Phone number must be 10 digits")
        .max(10, "Phone number must be 10 digits")
        .regex(/^\d+$/, "Phone number must contain only digits"),
    linkedin: zod_1.z.string().optional(),
    bio: zod_1.z.string().min(10, "bio is required"),
    departmentName: zod_1.z.string().min(2, "department name is required"),
    qualification: zod_1.z.string().min(2, "qualification is required"),
    experience: zod_1.z.number().min(0, "experience is required"),
    expertise: zod_1.z.array(zod_1.z.string()).min(1),
});
