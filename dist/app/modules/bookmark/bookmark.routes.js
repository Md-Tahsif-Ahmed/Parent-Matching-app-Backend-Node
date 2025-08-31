"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkRoutes = void 0;
const express_1 = __importDefault(require("express"));
const bookmark_controller_1 = require("./bookmark.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router.get("/", (0, auth_1.default)(user_1.USER_ROLES.USER), bookmark_controller_1.BookmarkController.getBookmark);
router.post("/:id", (0, auth_1.default)(user_1.USER_ROLES.USER), bookmark_controller_1.BookmarkController.toggleBookmark);
exports.BookmarkRoutes = router;
