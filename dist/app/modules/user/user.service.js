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
exports.UserService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const user_1 = require("../../../enums/user");
const user_model_1 = require("./user.model");
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const emailTemplate_1 = require("../../../shared/emailTemplate");
const emailHelper_1 = require("../../../helpers/emailHelper");
const createUserToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Optional nice 409 instead of raw E11000
    if (payload.email) {
        const exists = yield user_model_1.User.isExistUserByEmail(payload.email);
        if (exists)
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'Email already taken');
    }
    const user = new user_model_1.User({
        firstName: payload.firstName,
        lastName: payload.lastName,
        dob: payload.dob ? new Date(payload.dob) : undefined,
        email: payload.email,
        password: payload.password,
        name: payload.name,
    });
    yield user.save();
    // --- OTP + Email (from Method-1) ---
    const otp = (0, generateOTP_1.default)(); // e.g., 6-digit
    // ensure name is a string (fallback to email if name is undefined)
    const values = { name: (_a = user.name) !== null && _a !== void 0 ? _a : user.email, otp, email: user.email };
    // if sendEmail returns a Promise, we await so failures bubble up
    yield emailHelper_1.emailHelper.sendEmail(emailTemplate_1.emailTemplate.createAccount(values));
    // save OTP to DB (note: for production, hash the OTP)
    yield user_model_1.User.findByIdAndUpdate(user._id, {
        $set: {
            authentication: {
                oneTimeCode: otp,
                expireAt: new Date(Date.now() + 3 * 60000), // 3 minutes
                isResetPassword: false,
            },
            verified: false,
        },
    });
    return yield user_model_1.User.findById(user._id).populate('profile');
});
const createAdminToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload.email || !payload.password) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email and password required');
    }
    const exists = yield user_model_1.User.isExistUserByEmail(payload.email);
    if (exists)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'This email already taken');
    const user = new user_model_1.User({
        email: payload.email,
        password: payload.password,
        name: payload.name,
        role: user_1.USER_ROLES.ADMIN,
        verified: true,
    });
    yield user.save();
    return yield user_model_1.User.findById(user._id);
});
const getMyProfileFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield user_model_1.User.findById(userId).populate('profile');
    if (!doc)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    return doc;
});
const updateUserFromDB = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const allowed = {
        name: payload.name,
        firstName: payload.firstName,
        lastName: payload.lastName,
        dob: payload.dob ? new Date(payload.dob) : undefined,
    };
    const updated = yield user_model_1.User.findByIdAndUpdate(userId, { $set: allowed }, { new: true }).populate('profile');
    if (!updated)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    return updated;
});
exports.UserService = {
    createUserToDB,
    createAdminToDB,
    getMyProfileFromDB,
    updateUserFromDB,
};
