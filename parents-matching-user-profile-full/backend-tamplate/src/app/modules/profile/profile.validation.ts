import { z } from 'zod';

const itemsSchema = z.object({
  items: z.array(
    z.object({
      typeName: z.string().min(1).optional(),
      name: z.string().min(1),
    })
  ).max(50)
});

export const ProfileValidation = {
  updateBasic: z.object({
    body: z.object({
      displayName: z.string().trim().min(1).optional(),
      aboutMe: z.string().trim().max(2000).optional(),
      childAge: z.number().int().min(0).max(600).optional(),
    }),
  }),

  setJourney: z.object({
    body: z.object({
      journeyName: z.string().trim().min(1),
    }),
  }),

  setInterestsValues: z.object({
    body: z.object({
      interests: z.array(z.string().min(1)).max(50).optional(),
      values: z.array(z.string().min(1)).max(50).optional(),
    }).refine((b) => !!b.interests || !!b.values, { message: 'Provide interests or values' }),
  }),

  setDiagnoses: z.object({ body: itemsSchema.shape }),

  setTherapies: z.object({ body: itemsSchema.shape }),

  setLocation: z.object({
    body: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      locationText: z.string().trim().optional(),
    }),
  }),

  setConsent: z.object({
    body: z.object({
      agreed: z.boolean().refine(v => v === true, 'agreed must be true'),
    }),
  }),

  replacePhoto: z.object({ params: z.object({ index: z.string().regex(/^\d+$/) }) }),
  deletePhoto: z.object({ params: z.object({ index: z.string().regex(/^\d+$/) }) }),
};
