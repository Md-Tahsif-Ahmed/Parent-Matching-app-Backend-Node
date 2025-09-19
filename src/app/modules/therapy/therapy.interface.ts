import { Model } from 'mongoose';

export type ITherapy = {
  type: string;
  name: string;
};

export type TherapyModel = Model<ITherapy>;
