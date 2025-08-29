import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiErrors';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../types/auth';
import cryptoToken from '../../../util/cryptoToken';
import generateOTP from '../../../util/generateOTP';
import { ResetToken } from '../resetToken/resetToken.model';
import { User } from '../user/user.model';
import { Profile } from '../profile/profile.model';
 

const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;
  const isExistUser: any = await User.findOne({ email }).select('+password');
  if (!isExistUser) throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  if (!isExistUser.verified) throw new ApiError(StatusCodes.BAD_REQUEST, 'Please verify your account, then try to login again');
  if (password && !(await User.isMatchPassword(password, isExistUser.password))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }
  const accessToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );
  const refreshToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwtRefreshSecret as Secret,
    config.jwt.jwtRefreshExpiresIn as string
  );
  return { accessToken, refreshToken, next: 'HOME' };
};

const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser) throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  const otp = generateOTP();
  const value = { otp, email: isExistUser.email };
  const forgetPassword = emailTemplate.resetPassword(value);
  emailHelper.sendEmail(forgetPassword);
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + (((config as any).auth?.otpExpireMin) || 5) * 60000),
  };
  await User.findOneAndUpdate({ email }, { $set: { authentication } });
};

const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;
  const isExistUser: any = await User.findOne({ email }).select('+authentication');
  if (!isExistUser) throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  if (!oneTimeCode) throw new ApiError(StatusCodes.BAD_REQUEST, 'Please provide the OTP code');
  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
  }
  const now = new Date();
  if (now > isExistUser.authentication?.expireAt) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Otp already expired, Please try again');
  }

  if (!isExistUser.verified) {
    await User.findByIdAndUpdate(isExistUser._id, {
      verified: true,
      authentication: { oneTimeCode: null, expireAt: null, isResetPassword: false },
    });
    await Profile.findOneAndUpdate(
      { user: isExistUser._id },
      { $setOnInsert: { user: isExistUser._id, completion: 0 } },
      { upsert: true, new: true }
    );
    const accessToken = jwtHelper.createToken(
      { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string
    );
    const refreshToken = jwtHelper.createToken(
      { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
      config.jwt.jwtRefreshSecret as Secret,
      config.jwt.jwtRefreshExpiresIn as string
    );
    return {
      message: 'Email verified successfully',
      data: { accessToken, refreshToken, next: 'ONBOARDING' },
    };
  }

  await User.findByIdAndUpdate(isExistUser._id, {
    authentication: { isResetPassword: true, oneTimeCode: null, expireAt: null },
  });
  const createToken = cryptoToken();
  await ResetToken.create({
    user: isExistUser._id,
    token: createToken,
    expireAt: new Date(Date.now() + (((config as any).auth?.resetTokenExpireMin) || 10) * 60000),
  });
  return {
    message: 'Verification successful for reset password',
    data: createToken,
  };
};

const resetPasswordToDB = async (token: string, payload: IAuthResetPassword) => {
  const { newPassword, confirmPassword } = payload;
  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  const isExistUser: any = await User.findById(isExistToken.user).select('+authentication');
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "You don't have permission to change the password. Please click again to 'Forgot Password'");
  }
  const notExpired = await ResetToken.isExpireToken(token);
  if (!notExpired) throw new ApiError(StatusCodes.BAD_REQUEST, 'Token expired, Please click again to the forget password');
  if (newPassword !== confirmPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "New password and Confirm password doesn't match!");
  }
  const hashPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));
  await User.findByIdAndUpdate(isExistUser._id, {
    password: hashPassword,
    authentication: { isResetPassword: false },
  });
};

const changePasswordToDB = async (user: any, payload: IChangePassword) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser: any = await User.findById(user.id).select('+password');
  if (!isExistUser) throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  if (currentPassword && !(await User.isMatchPassword(currentPassword, isExistUser.password))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }
  if (currentPassword === newPassword) throw new ApiError(StatusCodes.BAD_REQUEST, 'Please give different password from current password');
  if (newPassword !== confirmPassword) throw new ApiError(StatusCodes.BAD_REQUEST, "Password and Confirm password doesn't matched");
  const hashPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));
  await User.findByIdAndUpdate(user.id, { password: hashPassword });
};

const newAccessTokenToUser = async (token: string) => {
  if (!token) throw new ApiError(StatusCodes.BAD_REQUEST, 'Token is required!');
  const verifyUser = jwtHelper.verifyToken(token, config.jwt.jwtRefreshSecret as Secret);
  const isExistUser = await User.findById(verifyUser?.id);
  if (!isExistUser) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized access');
  const accessToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );
  return { accessToken };
};

const resendVerificationEmailToDB = async (email: string) => {
  const existingUser: any = await User.findOne({ email }).lean();
  if (!existingUser) throw new ApiError(StatusCodes.NOT_FOUND, 'User with this email does not exist!');
  const otp = generateOTP();
  const value = { otp, email: existingUser.email };
  const htmlPayload = !existingUser.verified
    ? emailTemplate.createAccount({ name: existingUser.name, email: existingUser.email, otp })
    : emailTemplate.resetPassword(value);
  await User.findByIdAndUpdate(existingUser._id, {
    authentication: { oneTimeCode: otp, expireAt: new Date(Date.now() + (((config as any).auth?.otpExpireMin) || 5) * 60000) },
  });
  emailHelper.sendEmail(htmlPayload);
};

const deleteUserFromDB = async (user: any, password: string) => {
  const isExistUser: any = await User.findById(user.id).select('+password');
  if (!isExistUser) throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  if (password && !(await User.isMatchPassword(password, isExistUser.password))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }
  await User.findByIdAndDelete(user.id);
  return;
};

export const AuthService = {
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  newAccessTokenToUser,
  resendVerificationEmailToDB,
  deleteUserFromDB,
};
