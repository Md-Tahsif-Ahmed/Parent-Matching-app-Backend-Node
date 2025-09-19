import { z } from 'zod';

const createDiagnosisZodSchema = z.object({
  body: z.object({
    type: z.string({ required_error: 'Type is required' }),
    name: z.string({ required_error: 'Name is required' }),
  }),
});

export const DiagnosisValidation = {
  createDiagnosisZodSchema,
};
