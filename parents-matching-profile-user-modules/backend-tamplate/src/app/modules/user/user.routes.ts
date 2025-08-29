import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.get(
  '/profile',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  UserController.getUserProfile
);

// Only SUPER_ADMIN can create another admin
router.post(
  '/create-admin',
  auth(USER_ROLES.SUPER_ADMIN),
  validateRequest(UserValidation.createAdminZodSchema),
  UserController.createAdmin
);

// Register user (parent)
router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    // NOTE: Avatar/profile images are handled in /profile module, not here.
    UserController.updateProfile
  );

export const UserRoutes = router;
