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

// --- matchList controller ---
const matchList = catchAsync(async (req: Request, res: Response) => {
  const me = (req as any).user?.id;

 
  let page = 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const searchTerm = req.query.searchTerm ? String(req.query.searchTerm).trim() : undefined;

  if (!searchTerm && req.query.page) {
    page = Number(req.query.page) || 1;
  }

  const data = await ConversationService.matchList(me, {
    page,
    limit,
    searchTerm,
  });

  return sendResponse(res, {
    statusCode: StatusCodes.OK,                                                                                              
    success: true,
    message: "Matches list",
    data,
  });
});

// --- myActiveList controller ---
const myActiveList = catchAsync(async (req: Request, res: Response) => {
  const me = (req as any).user?.id;

 
  let page = 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const searchTerm = req.query.searchTerm ? String(req.query.searchTerm).trim() : undefined;

  if (!searchTerm && req.query.page) {
    page = Number(req.query.page) || 1;
  }

  const data = await ConversationService.myActiveList(me, {
    page,
    limit,
    searchTerm,
  });

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Active conversations",
    data,
  });
});



// const archivedList = catchAsync(async (req: Request, res: Response) => {
//   const me = (req as any).user?.id;
//   const { page, limit, searchTerm } = req.query;

//   const data = await ConversationService.archivedListWithProfiles(me, {
//     page: page ? Number(page) : undefined,
//     limit: limit ? Number(limit) : undefined,
//     searchTerm: searchTerm ? String(searchTerm) : undefined,
//   });

//   return sendResponse(res, {
//     statusCode: StatusCodes.OK,
//     success: true,
//     message: "Archived conversations",
//     data,
//   });
// });

const archivedList = catchAsync(async (req: Request, res: Response) => {
  const me = (req as any).user?.id;

  let page = 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const searchTerm = req.query.searchTerm ? String(req.query.searchTerm).trim() : undefined;

  if (!searchTerm && req.query.page) {
    page = Number(req.query.page) || 1;
  }

  const data = await ConversationService.archivedListWithProfiles(me, {
    page,
    limit,
    searchTerm,
  });

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Archived conversations",
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



export const ConversationController = { archive, matchList, myActiveList, recent, archivedList };
