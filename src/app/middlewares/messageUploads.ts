// src/middlewares/messageUploads.ts
import multer from "multer";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiErrors";
import { Request } from "express";
import fs from "fs";
import path from "path";

const UPLOAD_ROOT = process.env.UPLOAD_ROOT || path.resolve(process.cwd(), "uploads");
// message ফাইল রাখার সাবফোল্ডার (আপনি চাইলে 'messages'ও দিতে পারেন)
const MESSAGE_SUBDIR = process.env.MESSAGE_SUBDIR || "message";

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ফাইলনেম নিরাপদ ও ইউনিক রাখি
function safeName(original: string) {
  const ext = path.extname(original || "").toLowerCase();
  const base = (original || "file")
    .replace(ext, "")
    .replace(/[^\p{L}\p{N}\-_.]+/gu, "_")   // unicode safe
    .slice(0, 80);
  const stamp = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  return `${base || "file"}-${stamp}${ext}`;
}

export const uploadMessageAttachments = () => {
  // ✅ diskStorage: uploads/message[/<convId>] তে সেভ হবে
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // চাইলে per-conversation ফোল্ডার:
      // const convPart = String((req as any).params?.convId || "general");
      // const abs = path.join(UPLOAD_ROOT, MESSAGE_SUBDIR, convPart);
      const abs = path.join(UPLOAD_ROOT, MESSAGE_SUBDIR);
      try {
        ensureDir(abs);
        cb(null, abs);
      } catch (e) {
        cb(e as Error, abs);
      }
    },
    filename: (_req, file, cb) => {
      cb(null, safeName(file.originalname));
    },
  });

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
