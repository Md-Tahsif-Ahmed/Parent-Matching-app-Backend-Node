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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const review_model_1 = require("./review.model");
const http_status_codes_1 = require("http-status-codes");
const user_model_1 = require("../user/user.model");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const createReviewToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch baber and check if it exists in one query
    const user = yield user_model_1.User.findById(payload.barber);
    if (!user) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "No User Found");
    }
    if (payload.rating) {
        // checking the rating is valid or not;
        const rating = Number(payload.rating);
        if (rating < 1 || rating > 5) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid rating value");
        }
        // Update service's rating and total ratings count
        const ratingCount = user.ratingCount + 1;
        let newRating;
        if (user.rating === null || user.rating === 0) {
            // If no previous ratings, the new rating is the first one
            newRating = rating;
        }
        else {
            // Calculate the new rating based on previous ratings
            newRating = ((user.rating * user.ratingCount) + rating) / ratingCount;
        }
        yield user_model_1.User.findByIdAndUpdate({ _id: payload.barber }, { rating: parseFloat(newRating.toFixed(2)), ratingCount: ratingCount }, { new: true });
    }
    const result = yield review_model_1.Review.create(payload);
    if (!result) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed To create Review");
    }
    return payload;
});
exports.ReviewService = { createReviewToDB };
