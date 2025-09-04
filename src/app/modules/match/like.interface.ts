import { Types } from 'mongoose';
export interface ILike {
  from: Types.ObjectId;
  to: Types.ObjectId;
  type: 'LIKE' | 'PASS';
  expiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
