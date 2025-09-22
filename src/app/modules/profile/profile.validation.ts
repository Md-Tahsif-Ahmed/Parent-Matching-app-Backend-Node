// profile.validation.ts
import { z } from "zod";

const ItemSchema = z.object({
  typeName: z.string().trim().min(1).optional(),
  names: z.array(z.string().trim().min(1)).min(1),
});

// const itemsArraySchema = z.array(ItemSchema).min(1);

export const ProfileValidation = {
  // NEW: aboutMe only
  setAboutMe: z.object({
    body: z.object({
      aboutMe: z.string().max(2000),
    }),
  }),

  setChildDOB: z.object({
    body: z.object({
      // Accept ISO string or date; coerce to Date
      childDOB: z.coerce.date({
        required_error: "childDOB is required",
        invalid_type_error: "childDOB must be a valid date",
      }),
    }),
  }),

  setJourney: z.object({
    body: z.object({
      journeyName: z.string().trim().min(1),
    }),
  }),

  setInterestsValues: z.object({
    body: z
      .object({
        interests: z.array(z.string().min(1)).max(50).optional(),
        values: z.array(z.string().min(1)).max(50).optional(),
      })
      .refine((b) => !!b.interests || !!b.values, {
        message: "Provide interests or values",
      }),
  }),

setDiagnoses: z.object({
    body: z.union([
      ItemSchema,                              // { typeName?, names: [...] }
      z.object({ group: ItemSchema }),         // { group: {...} }
      z.array(ItemSchema).length(1),           // [ {...} ] ⇒  at least one item
    ]),
  }),
  setTherapies: z.object({
    body: z.union([
      ItemSchema,
      z.object({ group: ItemSchema }),
      z.array(ItemSchema).length(1),
    ]),
  }),

  setLocation: z.object({
    body: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      locationText: z.string().trim().optional(),
    }),
  }),

  setConsent: z.object({
    body: z.object({
      agreed: z.boolean().refine((v) => v === true, "agreed must be true"),
    }),
  }),

  replacePhoto: z.object({
    params: z.object({ index: z.string().regex(/^\d+$/) }),
  }),
  deletePhoto: z.object({
    params: z.object({ index: z.string().regex(/^\d+$/) }),
  }),
};
