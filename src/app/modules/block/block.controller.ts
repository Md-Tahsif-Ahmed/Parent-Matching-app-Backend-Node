// import { Request, Response } from 'express';
// import catchAsync from '../../../shared/catchAsync';
// import sendResponse from '../../../shared/sendResponse';
// import { StatusCodes } from 'http-status-codes';
// import { BlockService } from './block.service';
 

// const block = catchAsync(async (req: Request, res: Response) => {
//   const data = await BlockService.block((req as any).user.id, req.params.userId);
//   return sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Blocked', data });
// });

// const unblock = catchAsync(async (req: Request, res: Response) => {
//   const data = await BlockService.unblock((req as any).user.id, req.params.userId);
//   return sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Unblocked', data });
// });

// export const BlockController = { block, unblock };
// src/app/modules/block/block.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { BlockService } from './block.service';

const isObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

const block = catchAsync(async (req: Request, res: Response) => {
  const me = (req as any).user?.id;
  const { userId } = req.params;

  if (!isObjectId(userId)) {
    return sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: 'Invalid ObjectId for userId',
      data: null,
    });
  }

  const data = await BlockService.block(me, userId);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Blocked',
    data,
  });
});

const unblock = catchAsync(async (req: Request, res: Response) => {
  const me = (req as any).user?.id;
  const { userId } = req.params;

  if (!isObjectId(userId)) {
    return sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: 'Invalid ObjectId for userId',
      data: null,
    });
  }

  const data = await BlockService.unblock(me, userId);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Unblocked',
    data,
  });
});

const listMine = catchAsync(async (req: Request, res: Response) => {
  const me = (req as any).user?.id;
  const page = parseInt(String(req.query.page ?? '1'), 10);
  const limit = parseInt(String(req.query.limit ?? '20'), 10);

  const data = await BlockService.listMine(me, page, limit);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'My blocked users',
    data,
  });
});

export const BlockController = { block, unblock, listMine };
