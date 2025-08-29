import { Document, Types } from 'mongoose';

export interface ISimpleKV {
  typeName?: string;
  name: string;
}

export interface IGeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface IProfile extends Document {
  user: Types.ObjectId;
  displayName?: string;
  aboutMe?: string;
  childAge?: number;

  profilePicture?: { url: string; mime?: string; size?: number };
  galleryPhotos?: Array<{ url: string; mime?: string; size?: number }>;

  location?: IGeoPoint;
  locationText?: string;

  journeyName?: string;
  interests: string[];
  values: string[];

  diagnoses: ISimpleKV[];
  therapies: ISimpleKV[];

  completion?: number;
  consentAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
