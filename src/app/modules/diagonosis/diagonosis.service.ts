import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiErrors';
import { IDiagnosis } from './diagonosis.interface';
import { Diagnosis } from './diagonosis.model';
 

const createDiagnosisToDB = async (
  payload: IDiagnosis
): Promise<IDiagnosis> => {
  const diagnosis = await Diagnosis.create(payload);
  if (!diagnosis) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Diagnosis');
  }
  return diagnosis;
};

const diagnosesFromDB = async (): Promise<IDiagnosis[]> => {
  const diagnoses = await Diagnosis.find({});
  return diagnoses;
};

const deleteDiagnosisToDB = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID');
  }
  await Diagnosis.findByIdAndDelete(id);
  return;
};

const updateDiagnosisToDB = async (
  id: string,
  payload: IDiagnosis
): Promise<IDiagnosis> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID');
  }

  const updatedDiagnosis = await Diagnosis.findByIdAndUpdate(
    { _id: id },
    payload,
    { new: true }
  );
  if (!updatedDiagnosis) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update Diagnosis');
  }

  return updatedDiagnosis;
};

export const DiagnosisService = {
  createDiagnosisToDB,
  diagnosesFromDB,
  deleteDiagnosisToDB,
  updateDiagnosisToDB,
};
