// src/app/modules/user/user.controller.ts
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

// GET /users/me
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMyProfileFromDB((req as any).user.id);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User profile fetched',
    data: result,
  });
});

// POST /users
const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createUserToDB(req.body);
  return sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Your account has been created. Please verify your email with the OTP.',
    data: result,
  });
});



// PATCH /users/me
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateUserFromDB((req as any).user.id, req.body);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

// POST /users/admin
// const createAdmin = catchAsync(async (req: Request, res: Response) => {
//   const result = await UserService.createAdminToDB(req.body);
//   return sendResponse(res, {
//     statusCode: StatusCodes.CREATED,
//     success: true,
//     message: 'Admin created successfully',
//     data: result,
//   });
// });
 
export const UserController = {
  getUserProfile,
  createUser,
  updateUser,
  // createAdmin,
};
