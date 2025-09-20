import { z } from 'zod';

const createAdminZodSchema = z.object({
    body: z.object({
        firstName: z.string().trim().optional(),
        lastName:  z.string().trim().optional(),
        name: z.string({ required_error: 'Name is required' }),
        email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' }),
        password: z.string({ required_error: 'Password is required' }),
        dob:       z.string().refine((val) => !isNaN(Date.parse(val)), {
                  message: "Invalid date format",
               }).optional(),
        role: z.string({ required_error: 'Role is required' }),
    })
});

export const AdminValidation = {
    createAdminZodSchema,
};
