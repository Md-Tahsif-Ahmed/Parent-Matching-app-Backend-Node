// profile.validation.ts
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
 

  // NEW: aboutMe only
  setAboutMe: z.object({
    body: z.object({
      // খালি string দিলে clear করার সুযোগ রাখতে min(0)
      aboutMe: z.string().max(2000),
    }),
  }),

  // NEW: childAge only
  setChildAge: z.object({
    body: z.object({
      childAge: z.number().int().min(0).max(600),
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

  setDiagnoses: z.object({ body: itemsSchema }),
  setTherapies: z.object({ body: itemsSchema }),

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
