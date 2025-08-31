"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const report_controller_1 = require("./report.controller");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(user_1.USER_ROLES.BARBER), report_controller_1.ReportController.createReport);
exports.ReportRoutes = router;
