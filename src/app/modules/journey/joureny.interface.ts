import { Model } from 'mongoose';

export type IJourney = {
  journeyName: string;
};

export type JourneyModel = Model<IJourney>;
