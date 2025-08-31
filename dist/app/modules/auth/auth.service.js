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
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../../config"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const emailHelper_1 = require("../../../helpers/emailHelper");
const jwtHelper_1 = require("../../../helpers/jwtHelper");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const cryptoToken_1 = __importDefault(require("../../../util/cryptoToken"));
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const resetToken_model_1 = require("../resetToken/resetToken.model");
const user_model_1 = require("../user/user.model");
const profile_model_1 = require("../profile/profile.model");
const loginUserFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const isExistUser = yield user_model_1.User.findOne({ email }).select('+password');
    if (!isExistUser)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    if (!isExistUser.verified)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please verify your account, then try to login again');
    if (password && !(yield user_model_1.User.isMatchPassword(password, isExistUser.password))) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Password is incorrect!');
    }
    const accessToken = jwtHelper_1.jwtHelper.createToken({ id: isExistUser._id, role: isExistUser.role, email: isExistUser.email }, config_1.default.jwt.jwt_secret, config_1.default.jwt.jwt_expire_in);
    const refreshToken = jwtHelper_1.jwtHelper.createToken({ id: isExistUser._id, role: isExistUser.role, email: isExistUser.email }, config_1.default.jwt.jwtRefreshSecret, config_1.default.jwt.jwtRefreshExpiresIn);
    return { accessToken, refreshToken, next: 'HOME' };
});
const forgetPasswordToDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const isExistUser = yield user_model_1.User.isExistUserByEmail(email);
    if (!isExistUser)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    const otp = (0, generateOTP_1.default)();
    const value = { otp, email: isExistUser.email };
    const forgetPassword = emailTemplate_1.emailTemplate.resetPassword(value);
    emailHelper_1.emailHelper.sendEmail(forgetPassword);
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + (((_a = config_1.default.auth) === null || _a === void 0 ? void 0 : _a.otpExpireMin) || 5) * 60000),
    };
    yield user_model_1.User.findOneAndUpdate({ email }, { $set: { authentication } });
});
const verifyEmailToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { email, oneTimeCode } = payload;
    const isExistUser = yield user_model_1.User.findOne({ email }).select('+authentication');
    if (!isExistUser)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    if (!oneTimeCode)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please provide the OTP code');
    if (((_a = isExistUser.authentication) === null || _a === void 0 ? void 0 : _a.oneTimeCode) !== oneTimeCode) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You provided wrong otp');
    }
    const now = new Date();
    if (now > ((_b = isExistUser.authentication) === null || _b === void 0 ? void 0 : _b.expireAt)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Otp already expired, Please try again');
    }
    if (!isExistUser.verified) {
        yield user_model_1.User.findByIdAndUpdate(isExistUser._id, {
            verified: true,
            authentication: { oneTimeCode: null, expireAt: null, isResetPassword: false },
        });
        yield profile_model_1.Profile.findOneAndUpdate({ user: isExistUser._id }, { $setOnInsert: { user: isExistUser._id, completion: 0 } }, { upsert: true, new: true });
        const accessToken = jwtHelper_1.jwtHelper.createToken({ id: isExistUser._id, role: isExistUser.role, email: isExistUser.email }, config_1.default.jwt.jwt_secret, config_1.default.jwt.jwt_expire_in);
        const refreshToken = jwtHelper_1.jwtHelper.createToken({ id: isExistUser._id, role: isExistUser.role, email: isExistUser.email }, config_1.default.jwt.jwtRefreshSecret, config_1.default.jwt.jwtRefreshExpiresIn);
        return {
            message: 'Email verified successfully',
            data: { accessToken, refreshToken, next: 'ONBOARDING' },
        };
    }
    yield user_model_1.User.findByIdAndUpdate(isExistUser._id, {
        authentication: { isResetPassword: true, oneTimeCode: null, expireAt: null },
    });
    const createToken = (0, cryptoToken_1.default)();
    yield resetToken_model_1.ResetToken.create({
        user: isExistUser._id,
        token: createToken,
        expireAt: new Date(Date.now() + (((_c = config_1.default.auth) === null || _c === void 0 ? void 0 : _c.resetTokenExpireMin) || 10) * 60000),
    });
    return {
        message: 'Verification successful for reset password',
        data: createToken,
    };
});
// ..............................
// const verifyEmailToDB = async (payload: IVerifyEmail) => {
//   const { email } = payload;
//   const code = String(payload.oneTimeCode); // normalize
//   const user: any = await User.findOne({ email }).select('+authentication');
//   if (!user) throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
//   if (!code) throw new ApiError(StatusCodes.BAD_REQUEST, 'Please provide the OTP code');
//   const auth = user.authentication || {};
//   if (String(auth.oneTimeCode) !== code) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
//   }
//   if (!auth.expireAt || new Date() > new Date(auth.expireAt)) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Otp already expired, Please try again');
//   }
//   // ----- RESET PASSWORD FLOW -----
//   if (auth.isResetPassword === true) {
//     const resetToken = cryptoToken();
//     await ResetToken.create({
//       user: user._id,
//       token: resetToken,
//       expireAt: new Date(Date.now() + ((((config as any).auth?.resetTokenExpireMin) || 10) * 60000)),
//     });
//     await User.findByIdAndUpdate(user._id, {
//       authentication: { isResetPassword: false, oneTimeCode: null, expireAt: null },
//     });
//     return {
//       success: true,
//       message: 'Verification successful for reset password',
//       data: { resetToken, next: 'RESET_PASSWORD' },
//     };
//   }
//   // ----- FIRST-TIME EMAIL VERIFY (SIGNUP) -----
//   if (user.verified !== true) {
//     await User.findByIdAndUpdate(user._id, {
//       verified: true,
//       authentication: { isResetPassword: false, oneTimeCode: null, expireAt: null },
//     });
//     await Profile.findOneAndUpdate(
//       { user: user._id },
//       { $setOnInsert: { user: user._id, completion: 0 } },
//       { upsert: true, new: true }
//     );
//     const accessToken = jwtHelper.createToken(
//       { id: user._id, role: user.role, email: user.email },
//       config.jwt.jwt_secret as Secret,
//       config.jwt.jwt_expire_in as string
//     );
//     const refreshToken = jwtHelper.createToken(
//       { id: user._id, role: user.role, email: user.email },
//       config.jwt.jwtRefreshSecret as Secret,
//       config.jwt.jwtRefreshExpiresIn as string
//     );
//     return {
//       success: true,
//       message: 'Email verified successfully',
//       data: { accessToken, refreshToken, next: 'ONBOARDING' },
//     };
//   }
//   // ----- ALREADY VERIFIED (NOT A RESET OTP) -----
//   return {
//     success: true,
//     message: 'Email already verified',
//     data: { next: 'HOME' },
//   };
// };
// ..............................
const resetPasswordToDB = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { newPassword, confirmPassword } = payload;
    const isExistToken = yield resetToken_model_1.ResetToken.isExistToken(token);
    if (!isExistToken)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized');
    const isExistUser = yield user_model_1.User.findById(isExistToken.user).select('+authentication');
    if (!((_a = isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.authentication) === null || _a === void 0 ? void 0 : _a.isResetPassword)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "You don't have permission to change the password. Please click again to 'Forgot Password'");
    }
    const notExpired = yield resetToken_model_1.ResetToken.isExpireToken(token);
    if (!notExpired)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Token expired, Please click again to the forget password');
    if (newPassword !== confirmPassword) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "New password and Confirm password doesn't match!");
    }
    const hashPassword = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield user_model_1.User.findByIdAndUpdate(isExistUser._id, {
        password: hashPassword,
        authentication: { isResetPassword: false },
    });
});
const changePasswordToDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { currentPassword, newPassword, confirmPassword } = payload;
    const isExistUser = yield user_model_1.User.findById(user.id).select('+password');
    if (!isExistUser)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    if (currentPassword && !(yield user_model_1.User.isMatchPassword(currentPassword, isExistUser.password))) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Password is incorrect');
    }
    if (currentPassword === newPassword)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please give different password from current password');
    if (newPassword !== confirmPassword)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Password and Confirm password doesn't matched");
    const hashPassword = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield user_model_1.User.findByIdAndUpdate(user.id, { password: hashPassword });
});
const newAccessTokenToUser = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Token is required!');
    const verifyUser = jwtHelper_1.jwtHelper.verifyToken(token, config_1.default.jwt.jwtRefreshSecret);
    const isExistUser = yield user_model_1.User.findById(verifyUser === null || verifyUser === void 0 ? void 0 : verifyUser.id);
    if (!isExistUser)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Unauthorized access');
    const accessToken = jwtHelper_1.jwtHelper.createToken({ id: isExistUser._id, role: isExistUser.role, email: isExistUser.email }, config_1.default.jwt.jwt_secret, config_1.default.jwt.jwt_expire_in);
    return { accessToken };
});
const resendVerificationEmailToDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const existingUser = yield user_model_1.User.findOne({ email }).lean();
    if (!existingUser)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User with this email does not exist!');
    const otp = (0, generateOTP_1.default)();
    const value = { otp, email: existingUser.email };
    const htmlPayload = !existingUser.verified
        ? emailTemplate_1.emailTemplate.createAccount({ name: existingUser.name, email: existingUser.email, otp })
        : emailTemplate_1.emailTemplate.resetPassword(value);
    yield user_model_1.User.findByIdAndUpdate(existingUser._id, {
        authentication: { oneTimeCode: otp, expireAt: new Date(Date.now() + (((_a = config_1.default.auth) === null || _a === void 0 ? void 0 : _a.otpExpireMin) || 5) * 60000) },
    });
    emailHelper_1.emailHelper.sendEmail(htmlPayload);
});
const deleteUserFromDB = (user, password) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.User.findById(user.id).select('+password');
    if (!isExistUser)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    if (password && !(yield user_model_1.User.isMatchPassword(password, isExistUser.password))) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Password is incorrect');
    }
    yield user_model_1.User.findByIdAndDelete(user.id);
    return;
});
exports.AuthService = {
    verifyEmailToDB,
    loginUserFromDB,
    forgetPasswordToDB,
    resetPasswordToDB,
    changePasswordToDB,
    newAccessTokenToUser,
    resendVerificationEmailToDB,
    deleteUserFromDB,
};
