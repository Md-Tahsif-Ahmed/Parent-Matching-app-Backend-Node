import { model, Schema } from 'mongoose';
import { IDiagnosis, DiagnosisModel } from './diagnosis.interface';

const diagnosisSchema = new Schema<IDiagnosis, DiagnosisModel>(
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

export const Diagnosis = model<IDiagnosis, DiagnosisModel>(
  'Diagnosis',
  diagnosisSchema
);
