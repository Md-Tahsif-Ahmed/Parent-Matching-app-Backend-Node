import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { MessageService } from "./message.service";

const send = catchAsync(async (req: Request, res: Response) => {
  const data = await MessageService.send(
    (req as any).user.id,
    req.params.convId,
    req.body?.text,
    []
  );
  return sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Sent",
    data,
  });
});

const list = catchAsync(async (req: Request, res: Response) => {
  const data = await MessageService.list(
    (req as any).user.id,
    req.params.convId,
    Number(req.query.limit) || 50
  );
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "OK",
    data,
  });
});

export const MessageController = { send, list };
