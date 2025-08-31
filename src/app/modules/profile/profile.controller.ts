// profile.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

import { ProfileService } from './profile.service';
import ApiError from '../../../errors/ApiErrors';

const me = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.me(req.user.id);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile fetched successfully',
    data: profile,
  });
});
 
// NEW: aboutMe only
const setAboutMe = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.setAboutMe(req.user.id, req.body.aboutMe);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'About me updated',
    data: profile,
  });
});

// NEW: childAge only
const setChildAge = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.setChildAge(req.user.id, req.body.childAge);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Child age updated',
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

const pickFile = (req: any) => {
  // single('image')
  if (req.file) return req.file;

  // array('image', n)
  if (Array.isArray(req.files) && req.files.length) return req.files[0];

  // fields([{ name: 'image' }])
  if (req.files?.image?.[0]) return req.files.image[0];

  return null;
};

const uploadProfilePicture = catchAsync(async (req, res) => {
  const r: any = req;

  // fields([{ name:'image' }]) => req.files.image[0]
  // fallback রাখলাম যদি future এ single('image')/any() ইউজ করো
  const file =
    r?.files?.image?.[0] ??
    r?.file ??
    (Array.isArray(r?.files) ? r.files[0] : undefined);

  if (!file) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'File is required (send as form-data, key: "image")'
    );
  }

  const userId = (req as any).user?.id; // auth middleware যা বসায়

  const updatedProfile = await ProfileService.uploadProfilePicture(userId, file);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile picture updated',
    data: updatedProfile, // পুরো profile return করছি; চাইলে শুধু meta পাঠাতে পারো
  });
});

const addPhoto = catchAsync(async (req: Request, res: Response) => {
  const r: any = req;

  // prefer fields upload: req.files.image (array)
  // fallback: multer.any() or single -> req.files (array) or req.file
  const files: Express.Multer.File[] =
    r?.files?.image ??
    (Array.isArray(r?.files) ? r.files : undefined) ??
    (r?.file ? [r.file] : undefined) ??
    [];

  if (!files || files.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'File is required (send as form-data, key: "image")'
    );
  }

  // use new bulk service to add multiple files (enforces 4-photo limit)
  const profile = await ProfileService.addPhotos((req as any).user.id, files);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Photo added to gallery',
    data: profile,
  });
});

const replacePhoto = catchAsync(async (req: Request, res: Response) => {
  const file = pickFile(req);
  if (!file) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'File is required (send as form-data, key: "image")'
    );
  }

  const profile = await ProfileService.replacePhoto(
    (req as any).user.id,
    Number(req.params.index),
    file
  );

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Photo replaced',
    data: profile,
  });
});

const deletePhoto = catchAsync(async (req: Request, res: Response) => {
  const profile = await ProfileService.deletePhoto(
    (req as any).user.id,
    Number(req.params.index)
  );

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Photo removed',
    data: profile,
  });
});

export const ProfileController = {
  me,
  setAboutMe,    // NEW
  setChildAge,   // NEW
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
