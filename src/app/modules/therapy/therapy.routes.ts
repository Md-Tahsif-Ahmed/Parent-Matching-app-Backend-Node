import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { TherapyController } from './therapy.controller';
import validateRequest from '../../middlewares/validateRequest';
import { TherapyValidation } from './therapy.validation';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(TherapyValidation.createTherapyZodSchema),
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    TherapyController.createTherapy
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    TherapyController.getTherapies
  );

router
  .route('/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    TherapyController.updateTherapy
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    TherapyController.deleteTherapy
  );

export const TherapyRoutes = router;
