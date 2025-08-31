"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const unlinkFile = (file) => {
    const filePath = path_1.default.join('uploads', file);
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
};
exports.default = unlinkFile;
// import fs from 'fs';
// import path from 'path';
// const unlinkFile = (file: string) => {
//   const safe = file.replace(/^[/\\]+/, '');  // শুরুর / বা \ কেটে দাও
//   const filePath = path.join(process.cwd(), 'uploads', safe);
//   if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
// };
// export default unlinkFile;
