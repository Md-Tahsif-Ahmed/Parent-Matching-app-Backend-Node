import { Schema, model } from 'mongoose';
import { ILike } from './like.interface';

const LikeSchema = new Schema<ILike>({
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  to:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['LIKE','PASS'], required: true },
  expiresAt: { type: Date, default: null },
}, { timestamps: true });

LikeSchema.index({ from:1, to:1 }, { unique: true });

export const LikeModel = model<ILike>('Like', LikeSchema);
