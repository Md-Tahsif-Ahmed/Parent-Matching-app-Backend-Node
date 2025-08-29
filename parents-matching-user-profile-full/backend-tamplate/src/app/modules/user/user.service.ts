import { User } from './user.model';
import { IUser } from './user.interface';
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';

const createUserToDB = async (payload: Partial<IUser>) => {
  const user = new User({
    firstName: payload.firstName,
    lastName: payload.lastName,
    dob: payload.dob,
    email: payload.email,
    password: payload.password,
    name: payload.name,
  });
  await user.save();
  return await User.findById(user._id).populate('profile');
};

const createAdminToDB = async (payload: Partial<IUser>) => {
  if (!payload.email || !payload.password) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email and password required');
  }
  const user = new User({
    email: payload.email,
    password: payload.password,
    name: payload.name,
    role: 'ADMIN',
  } as any);
  await user.save();
  return user;
};

const getMyProfileFromDB = async (userId: string | Types.ObjectId) => {
  const doc = await User.findById(userId).populate('profile');
  if (!doc) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  return doc;
};

const updateMyBaseFromDB = async (userId: string, payload: Partial<IUser>) => {
  const allowed: Partial<IUser> = {
    name: payload.name,
    firstName: payload.firstName,
    lastName: payload.lastName,
    dob: payload.dob,
    contact: payload.contact,
  };
  const updated = await User.findByIdAndUpdate(userId, { $set: allowed }, { new: true }).populate('profile');
  if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  return updated;
};

export const UserService = {
  createUserToDB,
  createAdminToDB,
  getMyProfileFromDB,
  updateMyBaseFromDB,
};
