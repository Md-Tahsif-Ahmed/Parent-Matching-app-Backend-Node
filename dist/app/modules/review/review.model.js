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
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
const Service = [];
const reviewSchema = new mongoose_1.Schema({
    customer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    barber: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    service: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
    },
    comment: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
}, { timestamps: true });
//check user
reviewSchema.post('save', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const review = this;
        if (review.rating < 1 || review.rating > 5) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid rating value. Try give rating between 1 to 5");
        }
        const isExistService = yield Service.findById(review.service);
        if (!isExistService) {
            throw new Error("Service not found");
        }
        const ratingCount = Number(isExistService.totalRating) + 1;
        let newRating;
        if (isExistService.rating === null || isExistService.rating === 0) {
            newRating = review.rating;
        }
        else {
            // Calculate the new rating based on previous ratings
            newRating = ((Number(isExistService.rating) * Number(isExistService.totalRating)) + Number(review.rating)) / ratingCount;
        }
        const updatedService = yield Service.findByIdAndUpdate({ _id: review.service }, { rating: parseFloat(newRating.toFixed(2)), totalRating: ratingCount }, { new: true });
        if (!updatedService) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to update service");
        }
    });
});
exports.Review = (0, mongoose_1.model)("Review", reviewSchema);
