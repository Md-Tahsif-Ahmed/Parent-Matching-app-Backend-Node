// src/modules/message/message.controller.ts
import path from "path";
import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { MessageService } from "./message.service";

const UPLOAD_ROOT = process.env.UPLOAD_ROOT || path.resolve(process.cwd(), "uploads");

// SEND
const send = catchAsync(async (req: Request, res: Response) => {
  const text = typeof req.body?.text === "string" ? req.body.text : undefined;

  const pickFiles = (): Express.Multer.File[] => {
    if (Array.isArray((req as any).files)) return (req as any).files;
    const map = (req as any).files as Record<string, Express.Multer.File[]>;
    if (map && typeof map === "object") {
      const out: Express.Multer.File[] = [];
      if (Array.isArray(map.files)) out.push(...map.files);
      if (Array.isArray(map.file)) out.push(...map.file);
      return out;
    }
    if ((req as any).file) return [(req as any).file];
    return [];
  };

  const uploads = pickFiles();

  // MessageModel schema → { url, mime, size, name }
  // diskStorage f.path -> /uploads/...
  // memoryStorage  fallback  data URL
  const files = uploads.map((f) => {
    const fileAny = f as any;
    if (fileAny.path && typeof fileAny.path === "string") {
      const rel = path.relative(UPLOAD_ROOT, fileAny.path).split(path.sep).join("/"); // windows-safe
      const publicUrl = `/uploads/${rel}`;
      return {
        url: publicUrl,
        mime: f.mimetype,
        size: f.size,
        name: f.originalname,
      };
    }
    // fallback: memoryStorage
    if (f.buffer) {
      return {
        url: `data:${f.mimetype};base64,${f.buffer.toString("base64")}`,
        mime: f.mimetype,
        size: f.size,
        name: f.originalname,
      };
    }
    // very edge-case fallback
    return {
      url: "",
      mime: f.mimetype,
      size: f.size,
      name: f.originalname,
    };
  });

  const data = await MessageService.send(
    (req as any).user.id,
    req.params.convId,
    text,
    files
  );

  return sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Sent",
    data,
  });
});

// LIST
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

// NEW: SEEN (bulk seen)
const seen = catchAsync(async (req: Request, res: Response) => {
  const data = await MessageService.markSeen(
    (req as any).user.id,
    req.params.convId
  );
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Seen updated",
    data, // { seenAt, count }
  });
});

export const MessageController = { send, list, seen };
