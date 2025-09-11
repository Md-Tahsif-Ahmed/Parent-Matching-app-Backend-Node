// src/middlewares/messageUploads.ts
import multer from "multer";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiErrors";
import { Request } from "express";

export const uploadMessageAttachments = () => {
  const storage = multer.memoryStorage();

  const ALLOWED = new Set([
    "image/jpeg","image/png","image/jpg","image/webp","image/gif",
    "application/pdf","text/plain",
    "application/zip","application/x-zip-compressed",
    "application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]);

  const fileFilter: multer.Options["fileFilter"] = (req: Request, file, cb) => {
    if (file.fieldname !== "file" && file.fieldname !== "files") {
      return cb(new ApiError(StatusCodes.BAD_REQUEST, 'Use field "file" or "files"'));
    }
    if (!ALLOWED.has(file.mimetype)) {
      return cb(new ApiError(StatusCodes.BAD_REQUEST, `Unsupported type: ${file.mimetype}`));
    }
    cb(null, true);
  };

  const limits = { fileSize: 8 * 1024 * 1024, files: 10 }; // 8MB/ফাইল

  return multer({ storage, fileFilter, limits })
    .fields([{ name: "files", maxCount: 10 }, { name: "file", maxCount: 1 }]);
};
export const upload = uploadMessageAttachments();