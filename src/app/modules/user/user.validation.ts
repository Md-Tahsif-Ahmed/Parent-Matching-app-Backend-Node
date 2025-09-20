import { z } from "zod";
import { USER_ROLES } from "../../../enums/user";

const createUserZodSchema = z.object({
  body: z.object({
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    name: z.string().trim().optional(),
    email: z.string().email(),
    password: z.string().min(8),
    dob: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      })
      .optional(),
    role: z.nativeEnum(USER_ROLES).optional(),
  }),
});

const updateProfileZodSchema = z.object({
  body: z.object({
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    name: z.string().trim().optional(),
    dob: z.string().optional(),
  }),
});

export const UserValidation = {
  createUserZodSchema,
  updateProfileZodSchema,
};
