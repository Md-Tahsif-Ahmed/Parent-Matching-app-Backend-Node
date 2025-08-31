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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reservation = void 0;
const mongoose_1 = require("mongoose");
const crypto_1 = require("crypto");
const ReservationSchema = new mongoose_1.Schema({
    barber: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    customer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    service: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    status: {
        type: String,
        enum: ["Upcoming", "Accepted", "Rejected", "Canceled", "Completed"],
        default: "Upcoming",
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Refunded"],
        default: "Pending"
    },
    price: {
        type: Number,
        required: true
    },
    txid: {
        type: String,
        unique: true,
        index: true
    },
    cancelByCustomer: {
        type: Boolean,
        default: false
    },
    isReported: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
ReservationSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const reservation = this;
        if (reservation.isNew && !reservation.txid) {
            const prefix = "tx_";
            const uniqueId = (0, crypto_1.randomBytes)(8).toString("hex");
            reservation.txid = `${prefix}${uniqueId}`;
        }
        next();
    });
});
exports.Reservation = (0, mongoose_1.model)("Reservation", ReservationSchema);
