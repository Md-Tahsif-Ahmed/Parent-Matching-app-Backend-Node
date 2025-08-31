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
exports.ProfileService = void 0;
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
const profile_model_1 = require("./profile.model");
const pickUrlFromFile = (file) => {
    if (!file)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'File is required');
    const url = file.location ||
        file.path ||
        file.secure_url ||
        (file.filename ? `/images/${file.filename}` : null);
    if (!url)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Unable to resolve upload URL');
    return { url, mime: file.mimetype, size: file.size };
};
const requireProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield profile_model_1.Profile.findOne({ user: userId });
    if (!profile)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Profile not found');
    return profile;
});
const me = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield profile_model_1.Profile.findOne({ user: userId });
});
// NEW: aboutMe only
const setAboutMe = (userId, aboutMe) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const p = yield profile_model_1.Profile.findOneAndUpdate({ user: userId }, { $set: { aboutMe: (_b = (_a = aboutMe === null || aboutMe === void 0 ? void 0 : aboutMe.trim) === null || _a === void 0 ? void 0 : _a.call(aboutMe)) !== null && _b !== void 0 ? _b : '' } }, { new: true, upsert: true });
    return p;
});
// NEW: childAge only
const setChildAge = (userId, childAge) => __awaiter(void 0, void 0, void 0, function* () {
    const p = yield profile_model_1.Profile.findOneAndUpdate({ user: userId }, { $set: { childAge } }, { new: true, upsert: true });
    return p;
});
const setJourney = (userId, journeyName) => __awaiter(void 0, void 0, void 0, function* () {
    const p = yield profile_model_1.Profile.findOneAndUpdate({ user: userId }, { $set: { journeyName } }, { new: true, upsert: true });
    return p;
});
const setInterestsValues = (userId, interests, values) => __awaiter(void 0, void 0, void 0, function* () {
    const update = {};
    if (interests)
        update.interests = interests;
    if (values)
        update.values = values;
    const p = yield profile_model_1.Profile.findOneAndUpdate({ user: userId }, { $set: update }, { new: true, upsert: true });
    return p;
});
const setDiagnoses = (userId, items) => __awaiter(void 0, void 0, void 0, function* () {
    const bad = items.find(it => !it.name || it.name.trim().length === 0);
    if (bad)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Each diagnosis must contain a name');
    const p = yield profile_model_1.Profile.findOneAndUpdate({ user: userId }, { $set: { diagnoses: items } }, { new: true, upsert: true });
    return p;
});
const setTherapies = (userId, items) => __awaiter(void 0, void 0, void 0, function* () {
    const bad = items.find(it => !it.name || it.name.trim().length === 0);
    if (bad)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Each therapy must contain a name');
    const p = yield profile_model_1.Profile.findOneAndUpdate({ user: userId }, { $set: { therapies: items } }, { new: true, upsert: true });
    return p;
});
const setLocation = (userId, lat, lng, locationText) => __awaiter(void 0, void 0, void 0, function* () {
    const update = {
        location: { type: 'Point', coordinates: [lng, lat] },
    };
    if (locationText)
        update.locationText = locationText;
    const p = yield profile_model_1.Profile.findOneAndUpdate({ user: userId }, { $set: update }, { new: true, upsert: true });
    return p;
});
const setConsent = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const p = yield profile_model_1.Profile.findOneAndUpdate({ user: userId }, { $set: { consentAt: new Date() } }, { new: true, upsert: true });
    return p;
});
const uploadProfilePicture = (userId, file) => __awaiter(void 0, void 0, void 0, function* () {
    const media = pickUrlFromFile(file);
    const p = yield profile_model_1.Profile.findOneAndUpdate({ user: userId }, { $set: { profilePicture: media } }, { new: true, upsert: true });
    return p;
});
const addPhoto = (userId, file) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const media = pickUrlFromFile(file);
    const p = yield requireProfile(userId);
    if ((((_a = p.galleryPhotos) === null || _a === void 0 ? void 0 : _a.length) || 0) >= 4) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'PHOTO_LIMIT_REACHED');
    }
    if (!p.galleryPhotos)
        p.galleryPhotos = [];
    p.galleryPhotos.push(media);
    yield p.save();
    return p;
});
const replacePhoto = (userId, index, file) => __awaiter(void 0, void 0, void 0, function* () {
    const media = pickUrlFromFile(file);
    const p = yield requireProfile(userId);
    if (!p.galleryPhotos || index < 0 || index >= p.galleryPhotos.length) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid photo index');
    }
    p.galleryPhotos[index] = media;
    yield p.save();
    return p;
});
const deletePhoto = (userId, index) => __awaiter(void 0, void 0, void 0, function* () {
    const p = yield requireProfile(userId);
    if (!p.galleryPhotos || index < 0 || index >= p.galleryPhotos.length) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid photo index');
    }
    p.galleryPhotos.splice(index, 1);
    yield p.save();
    return p;
});
exports.ProfileService = {
    me,
    setAboutMe,
    setChildAge,
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
