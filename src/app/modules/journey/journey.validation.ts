import { z } from 'zod';

const createJourneyZodSchema = z.object({
  body: z.object({
    journeyName: z.string({ required_error: 'Journey name is required' }),
  }),
});

export const JourneyValidation = {
  createJourneyZodSchema,
};
