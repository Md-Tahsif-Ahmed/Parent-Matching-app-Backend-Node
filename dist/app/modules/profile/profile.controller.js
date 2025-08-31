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
exports.ProfileController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const profile_service_1 = require("./profile.service");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const me = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield profile_service_1.ProfileService.me(req.user.id);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Profile fetched successfully',
        data: profile,
    });
}));
// NEW: aboutMe only
const setAboutMe = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield profile_service_1.ProfileService.setAboutMe(req.user.id, req.body.aboutMe);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'About me updated',
        data: profile,
    });
}));
// NEW: childAge only
const setChildAge = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield profile_service_1.ProfileService.setChildAge(req.user.id, req.body.childAge);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Child age updated',
        data: profile,
    });
}));
const setJourney = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield profile_service_1.ProfileService.setJourney(req.user.id, req.body.journeyName);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Journey updated',
        data: profile,
    });
}));
const setInterestsValues = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield profile_service_1.ProfileService.setInterestsValues(req.user.id, req.body.interests, req.body.values);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Interests/Values updated',
        data: profile,
    });
}));
const setDiagnoses = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield profile_service_1.ProfileService.setDiagnoses(req.user.id, req.body.items);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Diagnoses updated',
        data: profile,
    });
}));
const setTherapies = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield profile_service_1.ProfileService.setTherapies(req.user.id, req.body.items);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Therapies updated',
        data: profile,
    });
}));
const setLocation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield profile_service_1.ProfileService.setLocation(req.user.id, req.body.lat, req.body.lng, req.body.locationText);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Location saved',
        data: profile,
    });
}));
const setConsent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield profile_service_1.ProfileService.setConsent(req.user.id);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Consent saved',
        data: profile,
    });
}));
const pickFile = (req) => {
    var _a, _b;
    // single('image')
    if (req.file)
        return req.file;
    // array('image', n)
    if (Array.isArray(req.files) && req.files.length)
        return req.files[0];
    // fields([{ name: 'image' }])
    if ((_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.image) === null || _b === void 0 ? void 0 : _b[0])
        return req.files.image[0];
    return null;
};
const uploadProfilePicture = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = pickFile(req);
    if (!file) {
        // ডিবাগে সুবিধা হবে:
        console.log('CT:', req.headers['content-type'], 'bodyKeys:', Object.keys(req.body));
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'File is required (send as form-data, key: "image")');
    }
    const profile = yield profile_service_1.ProfileService.uploadProfilePicture(req.user.id, file);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Profile picture updated',
        data: profile,
    });
}));
const addPhoto = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield profile_service_1.ProfileService.addPhoto(req.user.id, req.file);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Photo added to gallery',
        data: profile,
    });
}));
const replacePhoto = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield profile_service_1.ProfileService.replacePhoto(req.user.id, Number(req.params.index), req.file);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Photo replaced',
        data: profile,
    });
}));
const deletePhoto = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield profile_service_1.ProfileService.deletePhoto(req.user.id, Number(req.params.index));
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Photo removed',
        data: profile,
    });
}));
exports.ProfileController = {
    me,
    setAboutMe, // NEW
    setChildAge, // NEW
    setJourney,
    setInterestsValues,
    setDiagnoses,
    setTherapies,
    setLocation,
    setConsent,
    uploadProfilePicture,
    addPhoto,
    replacePhoto,
    deletePhoto,
};
