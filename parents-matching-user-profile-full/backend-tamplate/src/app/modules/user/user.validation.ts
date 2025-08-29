import { z } from 'zod';

const createAdminZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' }),
    password: z.string({ required_error: 'Password is required' }).min(8, { message: 'Password must be at least 8 characters' }),
    role: z.string({ required_error: 'Role is required' }),
  }),
});

const createUserZodSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    dob: z.string().datetime().optional(),
    email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' }),
    password: z.string({ required_error: 'Password is required' }).min(8, { message: 'Password must be at least 8 characters' }),
  }),
});

export const UserValidation = { createAdminZodSchema, createUserZodSchema };
