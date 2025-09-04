import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { MatchService } from './match.service';

const like = catchAsync(async (req, res) => {
  const data = await MatchService.like((req as any).user.id, req.params.userId);
  return sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'OK', data });
});

const pass = catchAsync(async (req, res) => {
  const data = await MatchService.pass((req as any).user.id, req.params.userId, req.body?.days);
  return sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Cooling set', data });
});

const startChat = catchAsync(async (req, res) => {
  const data = await MatchService.startChat((req as any).user.id, req.params.convId);
  return sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Chat started (for you)', data });
});

export const MatchController = { like, pass, startChat };
