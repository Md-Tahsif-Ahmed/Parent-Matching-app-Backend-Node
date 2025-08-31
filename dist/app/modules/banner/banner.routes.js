"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const banner_controller_1 = require("./banner.controller");
const fileUploaderHandler_1 = __importDefault(require("../../middlewares/fileUploaderHandler"));
const router = express_1.default.Router();
router.route('/')
    .post((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, fileUploaderHandler_1.default)(), banner_controller_1.BannerController.createBanner)
    .get((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), banner_controller_1.BannerController.getAllBanner);
router.route('/:id')
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, fileUploaderHandler_1.default)(), banner_controller_1.BannerController.updateBanner)
    .delete((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), banner_controller_1.BannerController.deleteBanner);
exports.BannerRoutes = router;
