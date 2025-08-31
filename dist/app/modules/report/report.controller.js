"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const report_service_1 = require("./report.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const createReport = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Object.assign({ barber: req.user.id }, req.body);
    const result = yield report_service_1.ReportService.createReportToDB(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Report Created Successfully",
        data: result,
    });
}));
exports.ReportController = {
    createReport
};
