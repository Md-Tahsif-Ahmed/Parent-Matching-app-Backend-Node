"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const admin_controller_1 = require("./admin.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const admin_validation_1 = require("./admin.validation");
const router = express_1.default.Router();
router.post('/create-admin', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), (0, validateRequest_1.default)(admin_validation_1.AdminValidation.createAdminZodSchema), admin_controller_1.AdminController.createAdmin);
router.get('/get-admin', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), admin_controller_1.AdminController.getAdmin);
router.delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), admin_controller_1.AdminController.deleteAdmin);
exports.AdminRoutes = router;
