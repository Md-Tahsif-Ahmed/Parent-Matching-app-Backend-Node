import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { z } from 'zod';
import { MatchController } from './match.controller';

// Mongo ObjectId সাধারণত 24-চর—তাই min(24) করা ভালো
const LikeReq = z.object({
  params: z.object({ userId: z.string().min(24) })
});

const PassReq = z.object({
  params: z.object({ userId: z.string().min(24) }),
  body: z.object({ days: z.number().int().min(1).max(30).optional() })
});

const StartChatReq = z.object({
  params: z.object({ convId: z.string().min(24) })
});

const router = express.Router();
router.use(auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.post('/like/:userId', validateRequest(LikeReq), MatchController.like);
router.post('/pass/:userId', validateRequest(PassReq), MatchController.pass);
router.post('/:convId/start-chat', validateRequest(StartChatReq), MatchController.startChat);

export const MatchRoutes = router;