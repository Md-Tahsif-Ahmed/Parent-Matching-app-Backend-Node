"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const user_1 = require("../../../enums/user");
const createUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().trim().optional(),
        lastName: zod_1.z.string().trim().optional(),
        name: zod_1.z.string().trim().optional(),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        dob: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid date format",
        }).optional(),
        role: zod_1.z.nativeEnum(user_1.USER_ROLES).optional()
    }),
});
const updateProfileZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().trim().optional(),
        lastName: zod_1.z.string().trim().optional(),
        name: zod_1.z.string().trim().optional(),
        dob: zod_1.z.string().optional(),
    })
});
const createAdminZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().trim().optional(),
        lastName: zod_1.z.string().trim().optional(),
        name: zod_1.z.string().trim().optional(),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        dob: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid date format",
        }).optional(),
        role: zod_1.z.nativeEnum(user_1.USER_ROLES)
    }),
});
exports.UserValidation = {
    createUserZodSchema,
    updateProfileZodSchema,
    createAdminZodSchema,
};
