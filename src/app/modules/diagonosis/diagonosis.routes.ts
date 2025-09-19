import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { DiagnosisController } from './diagnosis.controller';
import validateRequest from '../../middlewares/validateRequest';
import { DiagnosisValidation } from './diagnosis.validation';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(DiagnosisValidation.createDiagnosisZodSchema),
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    DiagnosisController.createDiagnosis
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    DiagnosisController.getDiagnoses
  );

router
  .route('/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    DiagnosisController.updateDiagnosis
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    DiagnosisController.deleteDiagnosis
  );

export const DiagnosisRoutes = router;
