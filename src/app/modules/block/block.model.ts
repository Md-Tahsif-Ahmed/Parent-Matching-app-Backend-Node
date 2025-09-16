import { Schema, model } from 'mongoose';
import { IBlock } from './block.interface';

const BlockSchema = new Schema<IBlock>({
  by:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

BlockSchema.index({ by:1, user:1 }, { unique: true });
users: { _id: 1 }
profiles: { user: 1 }

export const BlockModel = model<IBlock>('Block', BlockSchema);
