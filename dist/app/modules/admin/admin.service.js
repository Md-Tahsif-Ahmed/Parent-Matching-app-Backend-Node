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
exports.AdminService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_model_1 = require("../user/user.model");
const createAdminToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const createAdmin = yield user_model_1.User.create(payload);
    if (!createAdmin) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Admin');
    }
    if (createAdmin) {
        yield user_model_1.User.findByIdAndUpdate({ _id: createAdmin === null || createAdmin === void 0 ? void 0 : createAdmin._id }, { verified: true }, { new: true });
    }
    return createAdmin;
});
const deleteAdminFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistAdmin = yield user_model_1.User.findByIdAndDelete(id);
    if (!isExistAdmin) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to delete Admin');
    }
    return;
});
const getAdminFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const admins = yield user_model_1.User.find({ role: 'ADMIN' })
        .select('name email profile contact location');
    return admins;
});
exports.AdminService = {
    createAdminToDB,
    deleteAdminFromDB,
    getAdminFromDB
};
