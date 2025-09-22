import { Document, Types } from "mongoose";

export interface ISimpleKV {
  typeName: string;  
  names: string[];
}

export interface IGeoPoint {
  type: "Point";
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
  childDOB?: Date; // store in months (recommended)

  profilePicture?: IFileMeta;
  galleryPhotos?: IFileMeta[];

  location?: IGeoPoint;
  locationText?: string;

  journeyName?: string;
  interests: string[];
  values: string[];
  diagnoses?: ISimpleKV[];
  therapies?: ISimpleKV[];

  completion?: number; // onboarding progress (0-100)
  consentAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
