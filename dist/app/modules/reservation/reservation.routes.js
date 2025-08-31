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
exports.ReservationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const reservation_controller_1 = require("./reservation.controller");
const router = express_1.default.Router();
router.route("/")
    .post((0, auth_1.default)(user_1.USER_ROLES.CUSTOMER), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { price } = _a, othersPayload = __rest(_a, ["price"]);
        if (price > 0) {
            othersPayload.price = Number(price);
        }
        req.body = Object.assign(Object.assign({}, othersPayload), { customer: req.user.id });
        next();
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to Convert string to number" });
    }
}), reservation_controller_1.ReservationController.createReservation)
    .get((0, auth_1.default)(user_1.USER_ROLES.CUSTOMER), reservation_controller_1.ReservationController.customerReservation);
router.get("/barber", (0, auth_1.default)(user_1.USER_ROLES.BARBER), reservation_controller_1.ReservationController.barberReservation);
router.get("/barber-summery", (0, auth_1.default)(user_1.USER_ROLES.BARBER), reservation_controller_1.ReservationController.reservationSummerForBarber);
router.route("/:id")
    .get((0, auth_1.default)(user_1.USER_ROLES.BARBER), reservation_controller_1.ReservationController.reservationDetails)
    .patch((0, auth_1.default)(user_1.USER_ROLES.BARBER), reservation_controller_1.ReservationController.respondedReservation);
exports.ReservationRoutes = router;
