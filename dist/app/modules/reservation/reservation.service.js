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
exports.ReservationService = void 0;
const reservation_model_1 = require("./reservation.model");
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const report_model_1 = require("../report/report.model");
const mongoose_1 = __importDefault(require("mongoose"));
const notificationsHelper_1 = require("../../../helpers/notificationsHelper");
const createReservationToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const reservation = yield reservation_model_1.Reservation.create(payload);
    if (!reservation) {
        throw new Error('Failed to created Reservation ');
    }
    else {
        const data = {
            text: "Your reservation has been rejected. Try another Barber",
            receiver: payload.barber,
            referenceId: reservation._id,
            screen: "RESERVATION"
        };
        (0, notificationsHelper_1.sendNotifications)(data);
    }
    return reservation;
});
const barberReservationFromDB = (user, status) => __awaiter(void 0, void 0, void 0, function* () {
    const condition = {
        barber: user.id
    };
    if (status) {
        condition['status'] = status;
    }
    const reservation = yield reservation_model_1.Reservation.find(condition)
        .populate([
        {
            path: 'customer',
            select: "name"
        },
        {
            path: 'service',
            select: "title category ",
            populate: [
                {
                    path: "title",
                    select: "title"
                },
                {
                    path: "category",
                    select: "name"
                },
            ]
        }
    ])
        .select("customer service createdAt status price");
    // check how many reservation in each status
    const allStatus = yield Promise.all(["Upcoming", "Accepted", "Canceled", "Completed"].map((status) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            status,
            count: yield reservation_model_1.Reservation.countDocuments({ barber: user.id, status })
        };
    })));
    return { allStatus, reservation };
});
const customerReservationFromDB = (user, status) => __awaiter(void 0, void 0, void 0, function* () {
    const condition = {
        customer: user.id
    };
    if (status) {
        condition['status'] = status;
    }
    const reservation = yield reservation_model_1.Reservation.find(condition)
        .populate([
        {
            path: 'barber',
            select: "name"
        },
        {
            path: 'service',
            select: "title category rating totalRating",
            populate: [
                {
                    path: "title",
                    select: "title"
                },
                {
                    path: "category",
                    select: "name"
                },
            ]
        }
    ])
        .select("barber service createdAt status price");
    if (!reservation)
        throw [];
    return reservation;
});
const reservationSummerForBarberFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // total earnings
    const totalEarnings = yield reservation_model_1.Reservation.aggregate([
        {
            $match: { barber: user.id }
        },
        {
            $group: {
                _id: null,
                totalEarnings: { $sum: "$price" }
            }
        }
    ]);
    // total earnings today
    const today = new Date();
    const todayEarnings = yield reservation_model_1.Reservation.aggregate([
        {
            $match: { barber: user.id, createdAt: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) } }
        },
        {
            $group: {
                _id: null,
                todayEarnings: { $sum: "$price" }
            }
        }
    ]);
    // total reservations today
    const todayReservations = yield reservation_model_1.Reservation.countDocuments({
        barber: user.id,
        createdAt: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) }
    });
    // total reservations
    const totalReservations = yield reservation_model_1.Reservation.countDocuments({ barber: user.id });
    const data = {
        earnings: {
            total: ((_a = totalEarnings[0]) === null || _a === void 0 ? void 0 : _a.totalEarnings) || 0,
            today: ((_b = todayEarnings[0]) === null || _b === void 0 ? void 0 : _b.todayEarnings) || 0,
        },
        services: {
            today: todayReservations,
            total: totalReservations
        }
    };
    return data;
});
const reservationDetailsFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id))
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Reservation ID');
    const reservation = yield reservation_model_1.Reservation.findById(id)
        .populate([
        {
            path: 'customer',
            select: "name profile location"
        },
        {
            path: 'service',
            select: "title category"
        }
    ])
        .select("customer service createdAt status price");
    if (!reservation)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Reservation not found');
    const report = yield report_model_1.Report.findOne({ reservation: id }).select("reason");
    return { reservation, report, };
});
const respondedReservationFromDB = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id))
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Reservation ID');
    const updatedReservation = yield reservation_model_1.Reservation.findOneAndUpdate({ _id: id }, { status }, { new: true });
    if (!updatedReservation)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Failed to update reservation');
    if ((updatedReservation === null || updatedReservation === void 0 ? void 0 : updatedReservation.status) === "Rejected") {
        const data = {
            text: "Your reservation has been rejected. Try another Barber",
            receiver: updatedReservation.customer,
            referenceId: id,
            screen: "RESERVATION"
        };
        (0, notificationsHelper_1.sendNotifications)(data);
    }
    if ((updatedReservation === null || updatedReservation === void 0 ? void 0 : updatedReservation.status) === "Accepted") {
        const data = {
            text: "Your reservation has been Accepted. Your service will start soon",
            receiver: updatedReservation.customer,
            referenceId: id,
            screen: "RESERVATION"
        };
        (0, notificationsHelper_1.sendNotifications)(data);
    }
    if ((updatedReservation === null || updatedReservation === void 0 ? void 0 : updatedReservation.status) === "Canceled") {
        const data = {
            text: "Your reservation cancel request has been Accepted.",
            receiver: updatedReservation.customer,
            referenceId: id,
            screen: "RESERVATION"
        };
        (0, notificationsHelper_1.sendNotifications)(data);
    }
    return updatedReservation;
});
exports.ReservationService = {
    createReservationToDB,
    barberReservationFromDB,
    customerReservationFromDB,
    reservationSummerForBarberFromDB,
    reservationDetailsFromDB,
    respondedReservationFromDB
};
