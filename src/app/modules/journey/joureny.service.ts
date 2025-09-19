import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiErrors';
import { IJourney } from './joureny.interface';
import { Journey } from './joureny.model';

const createJourneyToDB = async (payload: IJourney): Promise<IJourney> => {
  const journey = await Journey.create(payload);
  if (!journey) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Journey');
  }
  return journey;
};

const journeysFromDB = async (): Promise<IJourney[]> => {
  const journeys = await Journey.find({});
  return journeys;
};

const deleteJourneyToDB = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID');
  }
  await Journey.findByIdAndDelete(id);
  return;
};

const updateJourneyToDB = async (
  id: string,
  payload: IJourney
): Promise<IJourney> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID');
  }

  const updatedJourney = await Journey.findByIdAndUpdate({ _id: id }, payload, {
    new: true,
  });
  if (!updatedJourney) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update Journey');
  }

  return updatedJourney;
};

export const JourneyService = {
  createJourneyToDB,
  journeysFromDB,
  deleteJourneyToDB,
  updateJourneyToDB,
};
