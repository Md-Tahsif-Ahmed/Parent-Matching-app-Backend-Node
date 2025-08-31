"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiImages = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../errors/ApiErrors"));
const baseUploadDir = path_1.default.join(process.cwd(), 'uploads');
const ensureDir = (dir) => {
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
};
ensureDir(baseUploadDir);
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname !== 'image') {
            return cb(new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'File field is not supported'), '');
        }
        const uploadDir = path_1.default.join(baseUploadDir, 'images');
        ensureDir(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const stem = file.originalname.replace(ext, '').toLowerCase().split(' ').join('-');
        cb(null, `${stem}-${Date.now()}${ext}`);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.fieldname !== 'image') {
        return cb(new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'This file field is not supported'));
    }
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
        return cb(new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only .jpeg, .png, .jpg file supported'));
    }
    cb(null, true);
};
// 👉 DEFAULT EXPORT: ready middleware (no factory)
const uploadSingleImageMiddleware = (0, multer_1.default)({ storage, fileFilter }).single('image');
exports.default = uploadSingleImageMiddleware;
// (optional) যদি গ্যালারি লাগে
const uploadMultiImages = (max = 3) => (0, multer_1.default)({ storage, fileFilter }).array('image', max);
exports.uploadMultiImages = uploadMultiImages;
