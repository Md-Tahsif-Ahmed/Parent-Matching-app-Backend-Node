import { Schema, model } from 'mongoose';
import { IConversation } from './conversation.interface';

const ParticipantSchema = new Schema({
  user:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  state: { type: String, enum: ['ACTIVE','PENDING','ARCHIVED','BLOCKED'], required: true }
},{ _id:false });

const ConversationSchema = new Schema<IConversation>({
  pairKey: { type: String, required: true, unique: true, index: true },
  participants: { type: [ParticipantSchema], required: true },
  lastMessageAt: { type: Date, default: null }
},{ timestamps:true });

ConversationSchema.index({ 'participants.user': 1 });

export const ConversationModel = model<IConversation>('Conversation', ConversationSchema);
