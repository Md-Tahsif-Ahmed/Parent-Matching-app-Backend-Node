"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminValidation = void 0;
const zod_1 = require("zod");
const createAdminZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().trim().optional(),
        lastName: zod_1.z.string().trim().optional(),
        name: zod_1.z.string({ required_error: 'Name is required' }),
        email: zod_1.z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' }),
        password: zod_1.z.string({ required_error: 'Password is required' }),
        role: zod_1.z.string({ required_error: 'Role is required' }),
    })
});
exports.AdminValidation = {
    createAdminZodSchema,
};
