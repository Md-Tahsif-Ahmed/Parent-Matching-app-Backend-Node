import { model, Schema } from 'mongoose';
import { ITherapy, TherapyModel } from './therapy.interface';

const therapySchema = new Schema<ITherapy, TherapyModel>(
  {
    type: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Therapy = model<ITherapy, TherapyModel>('Therapy', therapySchema);
