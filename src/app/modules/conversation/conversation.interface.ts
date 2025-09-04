import { Types } from 'mongoose';
export type ParticipantState = 'ACTIVE' | 'PENDING' | 'ARCHIVED' | 'BLOCKED';
export interface IParticipant { user: Types.ObjectId; state: ParticipantState; }
export interface IConversation {
  pairKey: string;
  participants: IParticipant[]; // exactly two
  lastMessageAt?: Date | null;
  createdAt?: Date; updatedAt?: Date;
}
