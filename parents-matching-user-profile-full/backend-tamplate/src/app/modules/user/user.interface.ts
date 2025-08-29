import { Document, Model } from 'mongoose';

export interface IAuthentication {
  isResetPassword?: boolean;
  oneTimeCode?: number | null;
  expireAt?: Date | null;
}

export interface IUser extends Document {
  name?: string;
  appId?: string;
  firstName?: string;
  lastName?: string;
  dob?: Date; // parent DOB (optional)
  role: string;
  email: string;
  contact?: string;
  password: string;
  verified: boolean;
  authentication?: IAuthentication;
  notificationTokens?: string[];
  // virtual
  profile?: any;
  createdAt: Date;
  updatedAt: Date;
}

export type UserModal = Model<IUser> & {
  isExistUserById(id: string): Promise<IUser | null>;
  isExistUserByEmail(email: string): Promise<IUser | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
};
