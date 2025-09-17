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
     
    // appId: { type: String },

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

    dob: { type: Date, required: false }, 

    password: {
      type: String,
      required: true,                    
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
// avatar virtual (from profile)
userSchema.virtual('avatar').get(function (this: any) {
  return this?.profile?.profilePicture?.url ?? null;
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

// ------- Indexes -------
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

userSchema.pre('findOneAndUpdate', function (next) {
  // get raw update object
  const update: any = this.getUpdate() ?? {};

  // if no $set, then consider the root object as $set
  const setObj = update.$set ?? update;

  const first = setObj.firstName;
  const last  = setObj.lastName;

  if ((!('name' in setObj) || !setObj.name) && (first || last)) {
    const composed = [first, last].filter(Boolean).join(' ').trim();
    if (composed) {
      // keep old update keys, but ensure $set exists
      this.setUpdate({
        ...update,
        $set: { ...setObj, name: composed }
      });
    }
  }

  next();
});




export const User = model<IUser, UserModal>("User", userSchema);
