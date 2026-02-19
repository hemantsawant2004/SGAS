"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginDto = exports.SignupDto = exports.CreateUserDto = void 0;
const zod_1 = require("zod");
const schemas_1 = require("../../schemas");
// import {
//   givenNameSchema,
//   passwordSchema,
//   roleSchema,
//   usernameSchema,
// } from "../../schemas";
exports.CreateUserDto = zod_1.z.object({
    body: zod_1.z.object({
        username: schemas_1.usernameSchema,
        given_name: schemas_1.givenNameSchema,
        role: schemas_1.roleSchema.optional(),
    }),
});
exports.SignupDto = zod_1.z.object({
    body: zod_1.z.object({
        username: schemas_1.usernameSchema,
        password: schemas_1.passwordSchema,
    }),
});
exports.LoginDto = zod_1.z.object({
    body: zod_1.z.object({
        username: schemas_1.usernameSchema,
        password: schemas_1.passwordSchema,
    }),
});
