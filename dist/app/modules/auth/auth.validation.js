"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
const createVerifyEmailZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' }),
        oneTimeCode: zod_1.z.number({ required_error: 'One time code is required' })
    })
});
const createLoginZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' }),
        password: zod_1.z.string({ required_error: 'Password is required' })
    })
});
const createForgetPasswordZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' }),
    })
});
const createResetPasswordZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        newPassword: zod_1.z.string({ required_error: 'Password is required' }),
        confirmPassword: zod_1.z.string({
            required_error: 'Confirm Password is required',
        })
    })
});
const createChangePasswordZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string({
            required_error: 'Current Password is required',
        }),
        newPassword: zod_1.z.string({ required_error: 'New Password is required' }),
        confirmPassword: zod_1.z.string({
            required_error: 'Confirm Password is required',
        })
    })
});
exports.AuthValidation = {
    createVerifyEmailZodSchema,
    createForgetPasswordZodSchema,
    createLoginZodSchema,
    createResetPasswordZodSchema,
    createChangePasswordZodSchema,
};
