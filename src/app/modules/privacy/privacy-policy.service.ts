import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { IPrivacy } from "./privacy-policy.interface";
import { Privacy } from "./privacy-policy.model";

const createPrivacyToDB = async (payload: IPrivacy): Promise<IPrivacy> => {
  const doc = await Privacy.create(payload);
  if (!doc) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Privacy");
  }
  return doc;
};

const updatePrivacyToDB = async (
  id: string,
  payload: Partial<IPrivacy>
): Promise<IPrivacy> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }

  const updated = await Privacy.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Privacy not found");
  }
  return updated;
};

const getPrivacyFromDB = async (): Promise<IPrivacy[]> => {
  return await Privacy.find({}).lean();
};

const deletePrivacyToDB = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }
  const deleted = await Privacy.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Privacy not found");
  }
};

export const PrivacyService = {
  createPrivacyToDB,
  updatePrivacyToDB,
  getPrivacyFromDB,
  deletePrivacyToDB,
};
