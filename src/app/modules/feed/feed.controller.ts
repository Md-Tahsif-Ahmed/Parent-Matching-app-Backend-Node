import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { FeedService } from './feed.service';

const list = catchAsync(async (req: Request, res: Response) => {
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
  const items = await FeedService.list((req as any).user.id, limit);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'OK',
    data: { items },
  });
});


export const FeedController = { list };