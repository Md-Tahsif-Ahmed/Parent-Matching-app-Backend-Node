import { Schema, model } from 'mongoose';
import { IProfile, IGeoPoint, ISimpleKV, IFileMeta } from './profile.interface';

// ---------- Sub-schemas ----------
const GeoPointSchema = new Schema<IGeoPoint>(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number],
      required: true, // [lng, lat]
      validate: {
        validator: (v: number[]) => Array.isArray(v) && v.length === 2,
        message: 'coordinates must be [lng, lat]',
      },
    },
  },
  { _id: false }
);

const SimpleKVSchema = new Schema<ISimpleKV>(
  {
    typeName: { type: String },
    name: { type: String, required: true },
  },
  { _id: false }
);

const FileMetaSchema = new Schema<IFileMeta>(
  {
    url: { type: String, required: true },
    mime: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

// gallery limit validator
const max4 = (arr: unknown[]) => !arr || arr.length <= 4;

// ---------- Main schema ----------
const ProfileSchema = new Schema<IProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },

    aboutMe: { type: String, trim: true },
    childDOB: { type: Date }, // months or years (decide in FE; recommend months)

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

    // diagnoses: { type: [SimpleKVSchema], default: [] },
    // therapies: { type: [SimpleKVSchema], default: [] },
    diagnosis: { type: SimpleKVSchema, required: false },
    therapy: { type: SimpleKVSchema, required: false },

    completion: { type: Number, default: 0 }, // 0–100
    consentAt: { type: Date },
  },
  { timestamps: true }
);

// optional indexes for quick search/filter
ProfileSchema.index({ 'diagnosis.name': 1 });
ProfileSchema.index({ 'therapy.name': 1 });

// geo index for location queries
ProfileSchema.index({ location: '2dsphere' });

 
// ---------- Model ----------
export const Profile = model<IProfile>('Profile', ProfileSchema);
