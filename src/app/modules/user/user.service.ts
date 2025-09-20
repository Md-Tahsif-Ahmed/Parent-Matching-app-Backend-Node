import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiErrors';

import { USER_ROLES } from '../../../enums/user';
import { IUser } from './user.interface';
import { User } from './user.model';

import generateOTP from '../../../util/generateOTP';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';

const createUserToDB = async (payload: Partial<IUser>) => {
  // Optional nice 409 instead of raw E11000
  if (payload.email) {
    const exists = await User.isExistUserByEmail(payload.email);
    if (exists) throw new ApiError(StatusCodes.CONFLICT, 'Email already taken');
  }

  const user = new User({
    firstName: payload.firstName,
    lastName: payload.lastName,
    dob: payload.dob ? new Date(payload.dob as any) : undefined,
    email: payload.email,
    password: payload.password,
    name: payload.name,
  });
  await user.save();

  // --- OTP + Email (from Method-1) ---
  const otp = generateOTP(); // e.g., 6-digit
  // ensure name is a string (fallback to email if name is undefined)
  const values = { name: user.name ?? user.email!, otp, email: user.email! };

  // if sendEmail returns a Promise, we await so failures bubble up
  await emailHelper.sendEmail(emailTemplate.createAccount(values));

  // save OTP to DB (note: for production, hash the OTP)
  await User.findByIdAndUpdate(user._id, {
    $set: {
      authentication: {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60_000), // 3 minutes
        isResetPassword: false,
      },
      verified: false,
    },
  });

  return await User.findById(user._id).populate('profile');
};


const getMyProfileFromDB = async (userId: string | Types.ObjectId) => {
  const doc = await User.findById(userId).populate('profile');
  if (!doc) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  return doc;
};

const updateUserFromDB = async (userId: string, payload: Partial<IUser>) => {
  const allowed: Partial<IUser> = {
    name: payload.name,
    firstName: payload.firstName,
    lastName: payload.lastName,
    dob: payload.dob ? new Date(payload.dob as any) : undefined,
  };

  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: allowed },
    { new: true }
  ).populate('profile');

  if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  return updated;
};

// const createAdminToDB = async (payload: Partial<IUser>) => {
//   if (!payload.email || !payload.password) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Email and password required');
//   }

//   const exists = await User.isExistUserByEmail(payload.email);
//   if (exists) throw new ApiError(StatusCodes.CONFLICT, 'This email already taken');

//   const user = new User({
//     email: payload.email,
//     password: payload.password,
//     name: payload.name,
//     role: USER_ROLES.ADMIN,
//     verified: true,
//   } as any);

//   await user.save();
//   return await User.findById(user._id);
// };

export const UserService = {
  createUserToDB,
  getMyProfileFromDB,
  updateUserFromDB,
  // createAdminToDB,
};
