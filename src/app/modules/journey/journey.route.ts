import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { JourneyController } from './journey.controller';
import validateRequest from '../../middlewares/validateRequest';
import { JourneyValidation } from './journey.validation';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(JourneyValidation.createJourneyZodSchema),
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    JourneyController.createJourney
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    JourneyController.getJourneys
  );

router
  .route('/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    JourneyController.updateJourney
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    JourneyController.deleteJourney
  );

export const JourneyRoutes = router;
