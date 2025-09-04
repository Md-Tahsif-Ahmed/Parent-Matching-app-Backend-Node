import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { ConversationService } from "./conversation.service";

const archive = catchAsync(async (req: Request, res: Response) => {
  const data = await ConversationService.archive(
    (req as any).user.id,
    req.params.id
  );
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Archived",
    data,
  });
});

const myList = catchAsync(async (req: Request, res: Response) => {
  const data = await ConversationService.myList((req as any).user.id);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "OK",
    data,
  });
});

const recent = catchAsync(async (req: Request, res: Response) => {
  const data = await ConversationService.recentMatches((req as any).user.id);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "OK",
    data,
  });
});

export const ConversationController = { archive, myList, recent };
