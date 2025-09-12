import { Types } from "mongoose";
export interface IAttachment {
  url: string;
  mime?: string;
  size?: number;
  name?: string;
}
export interface IMessage {
  conv: Types.ObjectId;
  from: Types.ObjectId;
  text?: string;
  files?: IAttachment[];
  deliveredAt?: Date;
  seenAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}
