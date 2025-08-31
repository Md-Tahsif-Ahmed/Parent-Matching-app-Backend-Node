"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
const mongoose_1 = require("mongoose");
// ---------- Sub-schemas ----------
const GeoPointSchema = new mongoose_1.Schema({
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
        type: [Number],
        required: true, // [lng, lat]
        validate: {
            validator: (v) => Array.isArray(v) && v.length === 2,
            message: 'coordinates must be [lng, lat]',
        },
    },
}, { _id: false });
const SimpleKVSchema = new mongoose_1.Schema({
    typeName: { type: String },
    name: { type: String, required: true },
}, { _id: false });
const FileMetaSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    mime: { type: String },
    size: { type: Number },
}, { _id: false });
// gallery limit validator
const max4 = (arr) => !arr || arr.length <= 4;
// ---------- Main schema ----------
const ProfileSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    aboutMe: { type: String, trim: true },
    childAge: { type: Number }, // months or years (decide in FE; recommend months)
    profilePicture: { type: FileMetaSchema },
    galleryPhotos: {
        type: [FileMetaSchema],
        default: [],
        validate: [max4, 'Gallery can contain at most 4 photos'],
    },
    location: { type: GeoPointSchema },
    locationText: { type: String, trim: true },
    journeyName: { type: String, trim: true },
    interests: { type: [String], default: [] },
    values: { type: [String], default: [] },
    diagnoses: { type: [SimpleKVSchema], default: [] },
    therapies: { type: [SimpleKVSchema], default: [] },
    completion: { type: Number, default: 0 }, // 0–100
    consentAt: { type: Date },
}, { timestamps: true });
// geo index for location queries
ProfileSchema.index({ location: '2dsphere' });
// ---------- Model ----------
exports.Profile = (0, mongoose_1.model)('Profile', ProfileSchema);
