"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRoutes = void 0;
// profile.routes.ts
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const profile_controller_1 = require("./profile.controller");
const profile_validation_1 = require("./profile.validation");
const fileUploaderHandler_1 = __importDefault(require("../../middlewares/fileUploaderHandler"));
const router = express_1.default.Router();
router.use((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.USER));
router.get('/me', profile_controller_1.ProfileController.me);
// NEW: dedicated routes
router.patch('/about-me', (0, validateRequest_1.default)(profile_validation_1.ProfileValidation.setAboutMe), profile_controller_1.ProfileController.setAboutMe);
router.patch('/child-age', (0, validateRequest_1.default)(profile_validation_1.ProfileValidation.setChildAge), profile_controller_1.ProfileController.setChildAge);
router.put('/journey', (0, validateRequest_1.default)(profile_validation_1.ProfileValidation.setJourney), profile_controller_1.ProfileController.setJourney);
router.put('/interests-values', (0, validateRequest_1.default)(profile_validation_1.ProfileValidation.setInterestsValues), profile_controller_1.ProfileController.setInterestsValues);
router.put('/diagnoses', (0, validateRequest_1.default)(profile_validation_1.ProfileValidation.setDiagnoses), profile_controller_1.ProfileController.setDiagnoses);
router.put('/therapies', (0, validateRequest_1.default)(profile_validation_1.ProfileValidation.setTherapies), profile_controller_1.ProfileController.setTherapies);
router.put('/location', (0, validateRequest_1.default)(profile_validation_1.ProfileValidation.setLocation), profile_controller_1.ProfileController.setLocation);
router.post('/consent', (0, validateRequest_1.default)(profile_validation_1.ProfileValidation.setConsent), profile_controller_1.ProfileController.setConsent);
// media
// router.put('/profile-picture',
//   uploadSingleImage,
//   ProfileController.uploadProfilePicture
// );
router.put('/profile-picture', fileUploaderHandler_1.default, (req, _res, next) => {
    const r = req;
    console.log('has file?', !!r.file, 'has files?', !!r.files, 'ct=', req.headers['content-type']);
    if (r.files && !Array.isArray(r.files))
        console.log('files keys:', Object.keys(r.files));
    next();
}, profile_controller_1.ProfileController.uploadProfilePicture);
// (গ্যালারি হলে)
// router.post('/photos', auth(...), galleryUploadArrayMiddleware, ProfileController.addPhoto)
// router.post('/photos',
//   fileUploadHandler(),
//   ProfileController.addPhoto
// );
// router.put('/photos/:index',
//   validateRequest(ProfileValidation.replacePhoto),
//   fileUploadHandler(),
//   ProfileController.replacePhoto
// );
router.delete('/photos/:index', (0, validateRequest_1.default)(profile_validation_1.ProfileValidation.deletePhoto), profile_controller_1.ProfileController.deletePhoto);
// router.post('/photos', auth(...roles), uploadSingleImage(), ProfileController.addPhoto);
// router.put('/photos/:index', auth(...roles), uploadSingleImage(), ProfileController.replacePhoto);
exports.ProfileRoutes = router;
