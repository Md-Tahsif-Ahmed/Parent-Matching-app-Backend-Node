// src/app/modules/block/block.validation.ts
import { z } from 'zod';

/** Mongo ObjectId (24 hex chars) */
export const ObjectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

/** :userId param for /:userId/block */
export const BlockParamSchema = z.object({
  userId: ObjectIdSchema,
});

/** (Optional) request body if you ever want to save a reason for blocking */
export const BlockBodySchema = z.object({
  reason: z.string().min(1).max(200).optional(),
});

/** Pre-baked objects to plug into validateRequest() */
export const BlockValidations = {
  block: { params: BlockParamSchema /*, body: BlockBodySchema */ },
  unblock: { params: BlockParamSchema },
};

// Types (handy if you want strong typing in controllers)
export type TBlockParams = z.infer<typeof BlockParamSchema>;
export type TBlockBody = z.infer<typeof BlockBodySchema>;
