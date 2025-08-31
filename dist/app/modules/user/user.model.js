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
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_1 = require("../../../enums/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../../config"));
const AuthenticationSchema = new mongoose_1.Schema({
    isResetPassword: { type: Boolean, default: false },
    oneTimeCode: { type: Number, default: null },
    expireAt: { type: Date, default: null, index: true },
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: false, trim: true },
    lastName: { type: String, required: false, trim: true },
    name: { type: String, required: false, trim: true },
    appId: { type: String },
    role: {
        type: String,
        enum: Object.values(user_1.USER_ROLES),
        required: true,
        default: user_1.USER_ROLES.USER, // ✅ parent default
    },
    email: {
        type: String,
        required: true, // ✅ required
        unique: true,
        lowercase: true,
        trim: true,
    },
    dob: { type: Date, required: true },
    password: {
        type: String,
        required: true, // ✅ required
        select: 0,
        minlength: 8,
    },
    verified: { type: Boolean, default: false },
    authentication: { type: AuthenticationSchema, select: 0 },
}, { timestamps: true });
// ---- 1:1 Profile relation (populate-friendly) ----
userSchema.virtual("profile", {
    ref: "Profile",
    localField: "_id",
    foreignField: "user",
    justOne: true,
});
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });
// ইউনিক ইমেইল ইনডেক্স নিশ্চিত
userSchema.index({ email: 1 }, { unique: true });
// ------- Statics -------
userSchema.statics.isExistUserById = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield this.findById(id).populate("profile");
    });
};
userSchema.statics.isExistUserByEmail = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield this.findOne({ email });
    });
};
userSchema.statics.isMatchPassword = function (password, hashPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(password, hashPassword);
    });
};
// ------- Hooks -------
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.password) {
            return next(new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Password is required"));
        }
        if (!this.isModified("password"))
            return next();
        this.password = yield bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
        next();
    });
});
// name auto-compose (save)
userSchema.pre('save', function (next) {
    if (!this.name) {
        const parts = [this.firstName, this.lastName].filter(Boolean).join(' ').trim();
        if (parts)
            this.name = parts;
    }
    next();
});
// name auto-compose (findOneAndUpdate)
userSchema.pre('findOneAndUpdate', function (next) {
    var _a, _b, _c;
    // @ts-ignore
    const update = (_a = this.getUpdate()) !== null && _a !== void 0 ? _a : {};
    if ((!('name' in update) || !(update === null || update === void 0 ? void 0 : update.name)) &&
        (('firstName' in update && (update === null || update === void 0 ? void 0 : update.firstName)) || ('lastName' in update && (update === null || update === void 0 ? void 0 : update.lastName)))) {
        const first = (_b = update === null || update === void 0 ? void 0 : update.firstName) !== null && _b !== void 0 ? _b : this.get('firstName');
        const last = (_c = update === null || update === void 0 ? void 0 : update.lastName) !== null && _c !== void 0 ? _c : this.get('lastName');
        const composed = [first, last].filter(Boolean).join(' ').trim();
        if (composed) {
            // @ts-ignore
            this.setUpdate(Object.assign(Object.assign({}, update), { name: composed }));
        }
    }
    next();
});
exports.User = (0, mongoose_1.model)("User", userSchema);
