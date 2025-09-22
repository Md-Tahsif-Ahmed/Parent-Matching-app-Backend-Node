import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiErrors';
import { IFaq } from './faq.interface';
import { Faq } from './faq.model';
import mongoose from 'mongoose';

const createFaqToDB = async (payload: IFaq): Promise<IFaq> => {
  const faqDoc = await Faq.create(payload);
  if (!faqDoc) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Faq');
  }

  return faqDoc.toObject() as IFaq;
};

const faqsFromDB = async (): Promise<IFaq[]> => {
  const faqs = await Faq.find({}).lean<IFaq[]>();
  return faqs;
};

const deleteFaqToDB = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID');
  }

  const deleted = await Faq.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Faq not found');
  }
};

const updateFaqToDB = async (id: string, payload: Partial<IFaq>): Promise<IFaq> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID');
  }

  const updated = await Faq.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Faq not found');
  }

  return updated.toObject() as IFaq;
};

export const FaqService = {
  createFaqToDB,
  updateFaqToDB,
  faqsFromDB,
  deleteFaqToDB,
};
