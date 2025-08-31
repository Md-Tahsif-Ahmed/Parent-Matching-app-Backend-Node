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
exports.PackageService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const package_model_1 = require("./package.model");
const mongoose_1 = __importDefault(require("mongoose"));
const createSubscriptionProductHelper_1 = require("../../../helpers/createSubscriptionProductHelper");
const stripe_1 = __importDefault(require("../../../config/stripe"));
const createPackageToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const productPayload = {
        title: payload.title,
        description: payload.description,
        duration: payload.duration,
        price: Number(payload.price),
    };
    const product = yield (0, createSubscriptionProductHelper_1.createSubscriptionProduct)(productPayload);
    if (!product) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to create subscription product");
    }
    if (product) {
        payload.paymentLink = product.paymentLink;
        payload.productId = product.productId;
    }
    const result = yield package_model_1.Package.create(payload);
    if (!result) {
        yield stripe_1.default.products.del(product.productId);
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to created Package");
    }
    return result;
});
const updatePackageToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid ID");
    }
    const result = yield package_model_1.Package.findByIdAndUpdate({ _id: id }, payload, { new: true });
    if (!result) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to Update Package");
    }
    return result;
});
const getPackageFromDB = (paymentType) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {
        status: "Active"
    };
    if (paymentType) {
        query.paymentType = paymentType;
    }
    const result = yield package_model_1.Package.find(query);
    return result;
});
const getPackageDetailsFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid ID");
    }
    const result = yield package_model_1.Package.findById(id);
    return result;
});
const deletePackageToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid ID");
    }
    const result = yield package_model_1.Package.findByIdAndUpdate({ _id: id }, { status: "Delete" }, { new: true });
    if (!result) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to deleted Package");
    }
    return result;
});
exports.PackageService = {
    createPackageToDB,
    updatePackageToDB,
    getPackageFromDB,
    getPackageDetailsFromDB,
    deletePackageToDB
};
