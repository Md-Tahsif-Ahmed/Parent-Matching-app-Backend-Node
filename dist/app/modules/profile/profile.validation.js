"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileValidation = void 0;
// profile.validation.ts
const zod_1 = require("zod");
const itemsSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        typeName: zod_1.z.string().min(1).optional(),
        name: zod_1.z.string().min(1),
    })).max(50)
});
exports.ProfileValidation = {
    // NEW: aboutMe only
    setAboutMe: zod_1.z.object({
        body: zod_1.z.object({
            // খালি string দিলে clear করার সুযোগ রাখতে min(0)
            aboutMe: zod_1.z.string().max(2000),
        }),
    }),
    // NEW: childAge only
    setChildAge: zod_1.z.object({
        body: zod_1.z.object({
            childAge: zod_1.z.number().int().min(0).max(600),
        }),
    }),
    setJourney: zod_1.z.object({
        body: zod_1.z.object({
            journeyName: zod_1.z.string().trim().min(1),
        }),
    }),
    setInterestsValues: zod_1.z.object({
        body: zod_1.z.object({
            interests: zod_1.z.array(zod_1.z.string().min(1)).max(50).optional(),
            values: zod_1.z.array(zod_1.z.string().min(1)).max(50).optional(),
        }).refine((b) => !!b.interests || !!b.values, { message: 'Provide interests or values' }),
    }),
    setDiagnoses: zod_1.z.object({ body: itemsSchema }),
    setTherapies: zod_1.z.object({ body: itemsSchema }),
    setLocation: zod_1.z.object({
        body: zod_1.z.object({
            lat: zod_1.z.number().min(-90).max(90),
            lng: zod_1.z.number().min(-180).max(180),
            locationText: zod_1.z.string().trim().optional(),
        }),
    }),
    setConsent: zod_1.z.object({
        body: zod_1.z.object({
            agreed: zod_1.z.boolean().refine(v => v === true, 'agreed must be true'),
        }),
    }),
    replacePhoto: zod_1.z.object({ params: zod_1.z.object({ index: zod_1.z.string().regex(/^\d+$/) }) }),
    deletePhoto: zod_1.z.object({ params: zod_1.z.object({ index: zod_1.z.string().regex(/^\d+$/) }) }),
};
