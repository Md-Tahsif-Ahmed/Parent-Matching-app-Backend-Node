import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { FeedController } from './feed.controller';

const router = express.Router();
router.use(auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.get('/', FeedController.list);

export const FeedRoutes = router;
