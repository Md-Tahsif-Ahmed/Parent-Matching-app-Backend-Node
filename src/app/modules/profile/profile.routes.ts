// profile.routes.ts
import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import { ProfileController } from './profile.controller';
import { ProfileValidation } from './profile.validation';

const router = express.Router();

router.use(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER));

router.get('/me', ProfileController.me);


// NEW: dedicated routes
router.patch('/about-me',
  validateRequest(ProfileValidation.setAboutMe),
  ProfileController.setAboutMe
);

router.patch('/child-age',
  validateRequest(ProfileValidation.setChildAge),
  ProfileController.setChildAge
);

router.put('/journey',
  validateRequest(ProfileValidation.setJourney),
  ProfileController.setJourney
);

router.put('/interests-values',
  validateRequest(ProfileValidation.setInterestsValues),
  ProfileController.setInterestsValues
);

router.put('/diagnoses',
  validateRequest(ProfileValidation.setDiagnoses),
  ProfileController.setDiagnoses
);

router.put('/therapies',
  validateRequest(ProfileValidation.setTherapies),
  ProfileController.setTherapies
);

router.put('/location',
  validateRequest(ProfileValidation.setLocation),
  ProfileController.setLocation
);

router.post('/consent',
  validateRequest(ProfileValidation.setConsent),
  ProfileController.setConsent
);

// media
router.put('/profile-picture',
  fileUploadHandler(),
  ProfileController.uploadProfilePicture
);

router.post('/photos',
  fileUploadHandler(),
  ProfileController.addPhoto
);

router.put('/photos/:index',
  validateRequest(ProfileValidation.replacePhoto),
  fileUploadHandler(),
  ProfileController.replacePhoto
);

router.delete('/photos/:index',
  validateRequest(ProfileValidation.deletePhoto),
  ProfileController.deletePhoto
);

export const ProfileRoutes = router;
