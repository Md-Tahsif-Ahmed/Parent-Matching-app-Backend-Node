import { Model } from 'mongoose';

export type IDiagnosis = {
  type: string;
  name: string;
};

export type DiagnosisModel = Model<IDiagnosis>;
