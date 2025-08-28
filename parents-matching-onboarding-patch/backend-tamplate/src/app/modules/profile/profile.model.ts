import { Schema, model, Types } from 'mongoose';

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
    typeName: { type: String },   // dropdown group (optional)
    name:     { type: String, required: true }, // dropdown item OR free-text when Others
  },
  { _id: false }
);

const ProfileSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', unique: true, required: true },

    displayName: { type: String },
    aboutMe:     { type: String },
    childAge:    { type: Number }, // months or years (decide in FE)

    profilePicture: { type: Object },  // snapshot of {url,mime,size}
    galleryPhotos:  { type: [Object], default: [], validate: [max4, 'Gallery can contain at most 4 photos'] },

    location:     { type: GeoPointSchema },
    locationText: { type: String },

    journeyName:  { type: String },
    interests:    { type: [String], default: [] },
    values:       { type: [String], default: [] },

    diagnoses:    { type: [SimpleKVSchema], default: [] },
    therapies:    { type: [SimpleKVSchema], default: [] },

    completion:   { type: Number, default: 0 },   // onboarding progress (0-100)
    consentAt:    { type: Date },                 // "I understand & agree"
  },
  { timestamps: true }
);

ProfileSchema.index({ location: '2dsphere' });

export const Profile = model('Profile', ProfileSchema);
