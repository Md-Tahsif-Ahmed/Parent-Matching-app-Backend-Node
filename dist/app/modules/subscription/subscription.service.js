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
exports.SubscriptionService = void 0;
const package_model_1 = require("../package/package.model");
const subscription_model_1 = require("./subscription.model");
const stripe_1 = __importDefault(require("../../../config/stripe"));
const user_model_1 = require("../user/user.model");
const subscriptionDetailsFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const subscription = yield subscription_model_1.Subscription.findOne({ user: user.id }).populate("package", "title credit").lean();
    if (!subscription) {
        return { subscription: {} }; // Return empty object if no subscription found
    }
    const subscriptionFromStripe = yield stripe_1.default.subscriptions.retrieve(subscription.subscriptionId);
    // Check subscription status and update database accordingly
    if ((subscriptionFromStripe === null || subscriptionFromStripe === void 0 ? void 0 : subscriptionFromStripe.status) !== "active") {
        yield Promise.all([
            user_model_1.User.findByIdAndUpdate(user.id, { isSubscribed: false }, { new: true }),
            subscription_model_1.Subscription.findOneAndUpdate({ user: user.id }, { status: "expired" }, { new: true }),
        ]);
    }
    return { subscription };
});
const companySubscriptionDetailsFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const subscription = yield subscription_model_1.Subscription.findOne({ user: id }).populate("package", "title credit").lean();
    if (!subscription) {
        return { subscription: {} }; // Return empty object if no subscription found
    }
    const subscriptionFromStripe = yield stripe_1.default.subscriptions.retrieve(subscription.subscriptionId);
    // Check subscription status and update database accordingly
    if ((subscriptionFromStripe === null || subscriptionFromStripe === void 0 ? void 0 : subscriptionFromStripe.status) !== "active") {
        yield Promise.all([
            user_model_1.User.findByIdAndUpdate(id, { isSubscribed: false }, { new: true }),
            subscription_model_1.Subscription.findOneAndUpdate({ user: id }, { status: "expired" }, { new: true }),
        ]);
    }
    return { subscription };
});
const subscriptionsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const anyConditions = [];
    const { search, limit, page, paymentType } = query;
    if (search) {
        const matchingPackageIds = yield package_model_1.Package.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { paymentType: { $regex: search, $options: "i" } },
            ]
        }).distinct("_id");
        if (matchingPackageIds.length) {
            anyConditions.push({
                package: { $in: matchingPackageIds }
            });
        }
    }
    if (paymentType) {
        anyConditions.push({
            package: { $in: yield package_model_1.Package.find({ paymentType: paymentType }).distinct("_id") }
        });
    }
    const whereConditions = anyConditions.length > 0 ? { $and: anyConditions } : {};
    const pages = parseInt(page) || 1;
    const size = parseInt(limit) || 10;
    const skip = (pages - 1) * size;
    const result = yield subscription_model_1.Subscription.find(whereConditions).populate([
        {
            path: "package",
            select: "title paymentType credit description"
        },
        {
            path: "user",
            select: "email name linkedIn contact company website "
        },
    ])
        .select("user package price trxId currentPeriodStart currentPeriodEnd status")
        .skip(skip)
        .limit(size);
    const count = yield subscription_model_1.Subscription.countDocuments(whereConditions);
    const data = {
        data: result,
        meta: {
            page: pages,
            total: count
        }
    };
    return data;
});
exports.SubscriptionService = {
    subscriptionDetailsFromDB,
    subscriptionsFromDB,
    companySubscriptionDetailsFromDB
};
