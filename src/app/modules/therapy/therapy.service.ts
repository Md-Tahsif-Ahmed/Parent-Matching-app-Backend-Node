import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiErrors';
import { ITherapy } from './therapy.interface';
import { Therapy } from './therapy.model';

const createTherapyToDB = async (payload: ITherapy): Promise<ITherapy> => {
  const therapy = await Therapy.create(payload);
  if (!therapy) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Therapy');
  }
  return therapy;
};

const therapiesFromDB = async (): Promise<ITherapy[]> => {
  const therapies = await Therapy.find({});
  return therapies;
};

const deleteTherapyToDB = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID');
  }
  await Therapy.findByIdAndDelete(id);
  return;
};

const updateTherapyToDB = async (
  id: string,
  payload: ITherapy
): Promise<ITherapy> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID');
  }

  const updatedTherapy = await Therapy.findByIdAndUpdate({ _id: id }, payload, {
    new: true,
  });
  if (!updatedTherapy) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update Therapy');
  }

  return updatedTherapy;
};

export const TherapyService = {
  createTherapyToDB,
  therapiesFromDB,
  deleteTherapyToDB,
  updateTherapyToDB,
};
