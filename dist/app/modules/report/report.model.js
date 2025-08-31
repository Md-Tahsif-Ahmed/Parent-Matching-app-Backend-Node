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
exports.Report = void 0;
const mongoose_1 = require("mongoose");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const reservation_model_1 = require("../reservation/reservation.model");
const reportSchema = new mongoose_1.Schema({
    customer: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    barber: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    reservation: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Reservation"
    },
    reason: [
        {
            type: String,
            required: true
        }
    ]
}, { timestamps: true });
//check user
reportSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const report = this;
        const updatedReservation = yield reservation_model_1.Reservation.findOneAndUpdate({ _id: report.reservation }, { isReported: true }, { new: true });
        if (!updatedReservation) {
            return next(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Reservation Not Found'));
        }
        next();
    });
});
exports.Report = (0, mongoose_1.model)("Report", reportSchema);
