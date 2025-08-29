import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ProfileService } from './profile.service';

const me = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.me(req.user.id);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile fetched successfully',
    data: profile,
  });
});

const updateBasic = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.updateBasic(req.user.id, req.body);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Basic info updated',
    data: profile,
  });
});

const setJourney = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.setJourney(req.user.id, req.body.journeyName);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Journey updated',
    data: profile,
  });
});

const setInterestsValues = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.setInterestsValues(
    req.user.id,
    req.body.interests,
    req.body.values
  );
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Interests/Values updated',
    data: profile,
  });
});

const setDiagnoses = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.setDiagnoses(req.user.id, req.body.items);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Diagnoses updated',
    data: profile,
  });
});

const setTherapies = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.setTherapies(req.user.id, req.body.items);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Therapies updated',
    data: profile,
  });
});

const setLocation = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.setLocation(
    req.user.id,
    req.body.lat,
    req.body.lng,
    req.body.locationText
  );
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Location saved',
    data: profile,
  });
});

const setConsent = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.setConsent(req.user.id);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Consent saved',
    data: profile,
  });
});

const uploadProfilePicture = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.uploadProfilePicture(req.user.id, (req as any).file);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile picture updated',
    data: profile,
  });
});

const addPhoto = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.addPhoto(req.user.id, (req as any).file);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Photo added to gallery',
    data: profile,
  });
});

const replacePhoto = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.replacePhoto(
    req.user.id,
    Number(req.params.index),
    (req as any).file
  );
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Photo replaced',
    data: profile,
  });
});

const deletePhoto = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.deletePhoto(req.user.id, Number(req.params.index));
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Photo removed',
    data: profile,
  });
});

export const ProfileController = {
  me,
  updateBasic,
  setJourney,
  setInterestsValues,
  setDiagnoses,
  setTherapies,
  setLocation,
  setConsent,
  uploadProfilePicture,
  addPhoto,
  replacePhoto,
  deletePhoto,
};
