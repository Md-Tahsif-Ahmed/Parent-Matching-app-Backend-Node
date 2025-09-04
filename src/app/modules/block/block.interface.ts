import { Types } from 'mongoose';
export interface IBlock {
  by: Types.ObjectId;    // blocker
  user: Types.ObjectId;  // blocked
  createdAt?: Date;
  updatedAt?: Date;
}
