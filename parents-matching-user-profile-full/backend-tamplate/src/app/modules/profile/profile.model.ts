import { Schema, model, Types } from 'mongoose';
import { IProfile } from './profile.interface';

const GeoPointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false }
);

const max4 = (arr: any[]) => !arr || arr.length <= 4;

const SimpleKVSchema = new Schema(
  {
    typeName: { type: String },
    name:     { type: String, required: true },
  },
  { _id: false }
);

const ProfileSchema = new Schema<IProfile>(
  {
    user: { type: Types.ObjectId, ref: 'User', unique: true, required: true },

    displayName: { type: String },
    aboutMe:     { type: String },
    childAge:    { type: Number },

    profilePicture: { type: Object },
    galleryPhotos:  { type: [Object], default: [], validate: [max4, 'You can upload at most 4 photos'] },

    location:     { type: GeoPointSchema as any },
    locationText: { type: String },

    journeyName:  { type: String },
    interests:    { type: [String], default: [] },
    values:       { type: [String], default: [] },

    diagnoses:    { type: [SimpleKVSchema], default: [] },
    therapies:    { type: [SimpleKVSchema], default: [] },

    completion:   { type: Number, default: 0 },
    consentAt:    { type: Date },
  },
  { timestamps: true }
);

ProfileSchema.index({ location: '2dsphere' });

export const Profile = model<IProfile>('Profile', ProfileSchema);
