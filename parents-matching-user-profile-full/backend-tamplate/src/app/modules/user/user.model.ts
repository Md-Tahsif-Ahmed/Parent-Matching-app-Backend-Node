import { model, Schema } from "mongoose";
import { USER_ROLES } from "../../../enums/user";
import { IUser, UserModal } from "./user.interface";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import config from "../../../config";

const AuthenticationSchema = new Schema(
  {
    isResetPassword: { type: Boolean, default: false },
    oneTimeCode: { type: Number, default: null },
    expireAt: { type: Date, default: null },
  },
  { _id: false }
);

const userSchema = new Schema<IUser, UserModal>(
  {
    name: { type: String },
    appId: { type: String },

    firstName: { type: String },
    lastName: { type: String },
    dob: { type: Date }, // optional parent DOB

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
      default: USER_ROLES.USER,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    contact: { type: String },

    password: {
      type: String,
      required: true,
      select: 0,
      minlength: 8,
    },

    verified: { type: Boolean, default: false },

    authentication: { type: AuthenticationSchema, select: 0 },

    notificationTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ----- Virtual: 1:1 relation with Profile -----
userSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

userSchema.index({ email: 1 }, { unique: true });

// ----- Statics -----
userSchema.statics.isExistUserById = async function (id: string) {
  const doc = await this.findById(id).populate('profile');
  return doc;
};

userSchema.statics.isExistUserByEmail = async function (email: string) {
  return await this.findOne({ email });
};

userSchema.statics.isMatchPassword = async function (
  password: string,
  hashPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashPassword);
};

// ----- Hooks -----
userSchema.pre('save', async function (next) {
  if (!this.password) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, "Password is required"));
  }
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, Number(config.bcrypt_salt_rounds));
  next();
});

export const User = model<IUser, UserModal>('User', userSchema);
