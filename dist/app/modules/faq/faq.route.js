"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const faq_controller_1 = require("./faq.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const faq_validation_1 = require("./faq.validation");
const router = express_1.default.Router();
router
    .route('/')
    .post((0, validateRequest_1.default)(faq_validation_1.FaqValidation.createFaqZodSchema), (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), faq_controller_1.FaqController.createFaq)
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), faq_controller_1.FaqController.getFaqs);
router
    .route('/:id')
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), faq_controller_1.FaqController.deleteFaq)
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), faq_controller_1.FaqController.updateFaq);
exports.FaqRoutes = router;
