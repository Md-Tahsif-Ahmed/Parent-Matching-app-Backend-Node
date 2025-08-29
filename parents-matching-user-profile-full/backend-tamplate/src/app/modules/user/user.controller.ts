import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { UserService } from './user.service';

export const UserController = {
  getUserProfile: catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.getMyProfileFromDB(req.user.id);
    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User profile fetched',
      data: result,
    });
  }),

  createUser: catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.createUserToDB(req.body);
    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'User created successfully',
      data: result,
    });
  }),

  createAdmin: catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.createAdminToDB(req.body);
    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Admin created successfully',
      data: result,
    });
  }),

  updateProfile: catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.updateMyBaseFromDB(req.user.id, req.body);
    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User updated successfully',
      data: result,
    });
  }),
};
