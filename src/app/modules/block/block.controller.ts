import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { BlockService } from './block.service';
 

const block = catchAsync(async (req: Request, res: Response) => {
  const data = await BlockService.block((req as any).user.id, req.params.userId);
  return sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Blocked', data });
});

const unblock = catchAsync(async (req: Request, res: Response) => {
  const data = await BlockService.unblock((req as any).user.id, req.params.userId);
  return sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Unblocked', data });
});

export const BlockController = { block, unblock };
