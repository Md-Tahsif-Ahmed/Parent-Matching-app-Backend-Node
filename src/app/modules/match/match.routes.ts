import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { z } from 'zod';
import { MatchController } from './match.controller';

const LikeParam = z.object({ userId: z.string().min(10) });
const PassBody  = z.object({ days: z.number().int().min(1).max(30).optional() });
const StartParam= z.object({ convId: z.string().min(10) });

const router = express.Router();
router.use(auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.post('/like/:userId',  validateRequest({ params: LikeParam } as any), MatchController.like);
router.post('/pass/:userId',  validateRequest({ params: LikeParam, body: PassBody } as any), MatchController.pass);
router.post('/:convId/start-chat', validateRequest({ params: StartParam } as any), MatchController.startChat);

export const MatchRoutes = router;
