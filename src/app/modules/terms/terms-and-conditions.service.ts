// terms-and-conditions.service.ts
import { ITermsAndConditions } from './terms-and-conditions.interface';
import { TermsAndConditions } from './terms-and-conditions.model';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

const createTermsAndConditionsToDB = async (
  payload: ITermsAndConditions
): Promise<ITermsAndConditions> => {
  const terms = await TermsAndConditions.create(payload);
  if (!terms) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Terms and Conditions');
  }
  return terms;
};

const updateTermsAndConditionsToDB = async (
  id: string,
  payload: Partial<ITermsAndConditions>  
): Promise<ITermsAndConditions> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID');
  }

  const updatedTerms = await TermsAndConditions.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,               
    }
  );

  if (!updatedTerms) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Terms and Conditions not found');  
  }
  return updatedTerms;
};

const getTermsAndConditionsFromDB = async (): Promise<ITermsAndConditions[]> => {
  return await TermsAndConditions.find({}).lean();  
};

const deleteTermsAndConditionsToDB = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID');
  }
  const deleted = await TermsAndConditions.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Terms and Conditions not found');  
  }
};

export const TermsAndConditionsService = {
  createTermsAndConditionsToDB,
  updateTermsAndConditionsToDB,
  getTermsAndConditionsFromDB,
  deleteTermsAndConditionsToDB
};
