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
    expireAt: { type: Date, default: null, index: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser, UserModal>(
  {
    firstName: { type: String, required: false, trim: true },
    lastName:  { type: String, required: false, trim: true },
    name:      { type: String, required: false, trim: true },
     
    appId: { type: String },

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
      default: USER_ROLES.USER,          // ✅ parent default
    },

    email: {
      type: String,
      required: true,                    // ✅ required
      unique: true,
      lowercase: true,
      trim: true,
    },

    dob: { type: Date, required: true }, 

    password: {
      type: String,
      required: true,                    // ✅ required
      select: 0,
      minlength: 8,
    },

    verified: { type: Boolean, default: false },

    authentication: { type: AuthenticationSchema, select: 0 },
  },
  { timestamps: true }
);

// ---- 1:1 Profile relation (populate-friendly) ----
userSchema.virtual("profile", {
  ref: "Profile",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

// ইউনিক ইমেইল ইনডেক্স নিশ্চিত
userSchema.index({ email: 1 }, { unique: true });

// ------- Statics -------
userSchema.statics.isExistUserById = async function (id: string) {
  return await this.findById(id).populate("profile");
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
 
// ------- Hooks -------
userSchema.pre("save", async function (next) {
  if (!this.password) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, "Password is required"));
  }
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

// name auto-compose (save)
userSchema.pre('save', function(next) {
  if (!this.name) {
    const parts = [this.firstName, this.lastName].filter(Boolean).join(' ').trim();
    if (parts) this.name = parts;
  }
  next();
});

// name auto-compose (findOneAndUpdate)
userSchema.pre('findOneAndUpdate', function(next) {
  // @ts-ignore
  const update = this.getUpdate() ?? {};
  if (
    (!('name' in update) || !(update as any)?.name) &&
    (('firstName' in update && (update as any)?.firstName) || ('lastName' in update && (update as any)?.lastName))
  ) {
    const first = (update as any)?.firstName ?? this.get('firstName');
    const last  = (update as any)?.lastName ?? this.get('lastName');
    const composed = [first, last].filter(Boolean).join(' ').trim();
    if (composed) {
      // @ts-ignore
      this.setUpdate({ ...update, name: composed });
    }
  }
  next();
});


export const User = model<IUser, UserModal>("User", userSchema);
