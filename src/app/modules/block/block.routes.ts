// src/app/modules/block/block.routes.ts
import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { BlockController } from './block.controller';
 

const router = express.Router();

router.use(auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.get('/blocks', BlockController.listMine);
router.post('/:userId/block', BlockController.block);
router.delete('/:userId/block', BlockController.unblock);

export const BlockRoutes = router;
