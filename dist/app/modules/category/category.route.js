"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const category_controller_1 = require("./category.controller");
const category_validation_1 = require("./category.validation");
const fileUploaderHandler_1 = __importDefault(require("../../middlewares/fileUploaderHandler"));
const router = express_1.default.Router();
router.post('/create-service', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), (0, fileUploaderHandler_1.default)(), (0, validateRequest_1.default)(category_validation_1.CategoryValidation.createCategoryZodSchema), category_controller_1.CategoryController.createCategory);
router
    .route('/:id')
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), (0, fileUploaderHandler_1.default)(), category_controller_1.CategoryController.updateCategory)
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), category_controller_1.CategoryController.deleteCategory);
router.get('/', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER), category_controller_1.CategoryController.getCategories);
exports.CategoryRoutes = router;
