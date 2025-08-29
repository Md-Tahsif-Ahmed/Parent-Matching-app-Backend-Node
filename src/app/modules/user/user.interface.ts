import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export interface IAuthenticationProps {
  isResetPassword: boolean;
  oneTimeCode: number | null;
  expireAt: Date | null;
}

export type IUser = {
  firstName?: string;
  lastName?: string;
  name?: string;                 
  appId?: string;
  role: USER_ROLES;
  dob: Date;
  email: string;
  password: string;               
  verified: boolean;
  authentication?: IAuthenticationProps;
   
};

export type UserModal = Model<IUser> & {
  isExistUserById(id: string): Promise<IUser | null>;
  isExistUserByEmail(email: string): Promise<IUser | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
 
};
