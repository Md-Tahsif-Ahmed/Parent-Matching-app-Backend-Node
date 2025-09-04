import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { z } from 'zod';
import { BlockController } from './block.controller';

const Param = z.object({ userId: z.string().min(10) });

const router = express.Router();
router.use(auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.post('/:userId/block',   validateRequest({ params: Param } as any), BlockController.block);
router.delete('/:userId/block', validateRequest({ params: Param } as any), BlockController.unblock);

export const BlockRoutes = router;
