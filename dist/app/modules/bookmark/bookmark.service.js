"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const bookmark_model_1 = require("./bookmark.model");
const toggleBookmark = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the bookmark already exists
    const existingBookmark = yield bookmark_model_1.Bookmark.findOne({
        user: payload.user,
        service: payload.service
    });
    if (existingBookmark) {
        // If the bookmark exists, delete it
        yield bookmark_model_1.Bookmark.findByIdAndDelete(existingBookmark._id);
        return "Bookmark Remove successfully";
    }
    else {
        // If the bookmark doesn't exist, create it
        const result = yield bookmark_model_1.Bookmark.create(payload);
        if (!result) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.EXPECTATION_FAILED, "Failed to add bookmark");
        }
        return "Bookmark Added successfully";
    }
});
const getBookmark = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bookmark_model_1.Bookmark.find({ user: user === null || user === void 0 ? void 0 : user.id })
        .populate({
        path: 'artist',
        model: 'User',
        select: '_id name profile',
        populate: {
            path: 'lesson',
            model: 'Lesson',
            select: 'rating totalRating gallery lessonTitle'
        }
    }).select("artist");
    return result === null || result === void 0 ? void 0 : result.map((bookmark) => {
        var _a;
        const _b = (_a = bookmark === null || bookmark === void 0 ? void 0 : bookmark.artist) === null || _a === void 0 ? void 0 : _a.toObject(), { lesson } = _b, otherData = __rest(_b, ["lesson"]);
        // Remove the lesson ID field if it exists
        if (lesson === null || lesson === void 0 ? void 0 : lesson._id) {
            lesson === null || lesson === void 0 ? true : delete lesson._id;
        }
        return Object.assign(Object.assign(Object.assign({}, otherData), lesson), { status: true });
    });
});
exports.BookmarkService = { toggleBookmark, getBookmark };
