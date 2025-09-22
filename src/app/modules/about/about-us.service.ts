import { AboutUs } from './about-us.model';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { IAboutUs } from './about-us.interface';

const createAboutUsToDB = async (payload: IAboutUs): Promise<IAboutUs> => {
    const aboutUs = await AboutUs.create(payload);
    if (!aboutUs) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create About Us');
    }

    return aboutUs;
};

const updateAboutUsToDB = async (id: string, payload: Partial<IAboutUs>): Promise<IAboutUs> => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID');
    }

    const updatedAboutUs = await AboutUs.findByIdAndUpdate(id, payload, { new: true });
    if (!updatedAboutUs) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update About Us');
    }

    return updatedAboutUs;
};

const getAboutUsFromDB = async (): Promise<IAboutUs[]> => {
    return await AboutUs.find({});
};

const deleteAboutUsToDB = async (id: string): Promise<void> => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID');
    }

    await AboutUs.findByIdAndDelete(id);
};

export const AboutUsService = {
    createAboutUsToDB,
    updateAboutUsToDB,
    getAboutUsFromDB,
    deleteAboutUsToDB
};
