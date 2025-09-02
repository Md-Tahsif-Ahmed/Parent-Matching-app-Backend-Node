import { Document, Types } from 'mongoose';

export interface ISimpleKV {
  typeName?: string;   // dropdown group (optional)
  name: string;        // dropdown item OR free-text when "Others"
}

export interface IGeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface IFileMeta {
  url: string;
  mime?: string;
  size?: number;
}

export interface IProfile extends Document {
  user: Types.ObjectId;

  aboutMe?: string;
  childAge?: number; // store in months (recommended)

  profilePicture?: IFileMeta;
  galleryPhotos?: IFileMeta[];

  location?: IGeoPoint;
  locationText?: string;

  journeyName?: string;
  interests: string[];
  values: string[];

  // diagnoses: ISimpleKV[];
  // therapies: ISimpleKV[];
   // ✅ singular (NOT arrays)
  diagnosis?: ISimpleKV;
  therapy?: ISimpleKV;

  completion?: number;  // onboarding progress (0-100)
  consentAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
