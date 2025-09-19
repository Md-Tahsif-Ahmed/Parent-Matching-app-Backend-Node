import { model, Schema } from 'mongoose';
import { IJourney, JourneyModel } from './joureny.interface';


const journeySchema = new Schema<IJourney, JourneyModel>(
  {
    journeyName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Journey = model<IJourney, JourneyModel>('Journey', journeySchema);
