import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import { Profile } from './profile.model';

type UserId = string | Types.ObjectId;

function pickUrlFromFile(file?: any): { url: string, mime?: string, size?: number } {
  if (!file) throw new ApiError(StatusCodes.BAD_REQUEST, 'File is required');
  const url = file.location || file.path || file.secure_url || (file.filename ? `/uploads/${file.filename}` : null);
  if (!url) throw new ApiError(StatusCodes.BAD_REQUEST, 'Unable to resolve upload URL');
  return { url, mime: file.mimetype, size: file.size };
}

async function requireProfile(userId: UserId) {
  const profile = await Profile.findOne({ user: userId });
  if (!profile) throw new ApiError(StatusCodes.NOT_FOUND, 'Profile not found');
  return profile;
}

export const ProfileService = {
  async me(userId: UserId) {
    return await Profile.findOne({ user: userId });
  },

  async updateBasic(userId: UserId, payload: Partial<{ displayName: string; aboutMe: string; childAge: number }>) {
    const p = await Profile.findOneAndUpdate({ user: userId }, { $set: payload }, { new: true, upsert: true });
    return p;
  },

  async setJourney(userId: UserId, journeyName: string) {
    const p = await Profile.findOneAndUpdate({ user: userId }, { $set: { journeyName } }, { new: true, upsert: true });
    return p;
  },

  async setInterestsValues(userId: UserId, interests?: string[], values?: string[]) {
    const update: any = {};
    if (interests) update.interests = interests;
    if (values) update.values = values;
    const p = await Profile.findOneAndUpdate({ user: userId }, { $set: update }, { new: true, upsert: true });
    return p;
  },

  async setDiagnoses(userId: UserId, items: Array<{ typeName?: string; name: string }>) {
    // simple XOR: allow ({typeName?, name}) always; "Others" client will send only name
    const bad = items.find(it => !it.name || it.name.trim().length === 0);
    if (bad) throw new ApiError(StatusCodes.BAD_REQUEST, 'Each diagnosis must contain a name');
    const p = await Profile.findOneAndUpdate({ user: userId }, { $set: { diagnoses: items } }, { new: true, upsert: true });
    return p;
  },

  async setTherapies(userId: UserId, items: Array<{ typeName?: string; name: string }>) {
    const bad = items.find(it => !it.name || it.name.trim().length === 0);
    if (bad) throw new ApiError(StatusCodes.BAD_REQUEST, 'Each therapy must contain a name');
    const p = await Profile.findOneAndUpdate({ user: userId }, { $set: { therapies: items } }, { new: true, upsert: true });
    return p;
  },

  async setLocation(userId: UserId, lat: number, lng: number, locationText?: string) {
    const update: any = {
      location: { type: 'Point', coordinates: [lng, lat] },
    };
    if (locationText) update.locationText = locationText;
    const p = await Profile.findOneAndUpdate({ user: userId }, { $set: update }, { new: true, upsert: true });
    return p;
  },

  async setConsent(userId: UserId) {
    const p = await Profile.findOneAndUpdate({ user: userId }, { $set: { consentAt: new Date() } }, { new: true, upsert: true });
    return p;
  },

  async uploadProfilePicture(userId: UserId, file: any) {
    const media = pickUrlFromFile(file);
    const p = await Profile.findOneAndUpdate({ user: userId }, { $set: { profilePicture: media } }, { new: true, upsert: true });
    return p;
  },

  async addPhoto(userId: UserId, file: any) {
    const media = pickUrlFromFile(file);
    const p = await requireProfile(userId);
    if ((p.galleryPhotos?.length || 0) >= 4) {
      throw new ApiError(StatusCodes.CONFLICT, 'PHOTO_LIMIT_REACHED');
    }
    p.galleryPhotos = [...(p.galleryPhotos || []), media];
    await p.save();
    return p;
  },

  async replacePhoto(userId: UserId, index: number, file: any) {
    const media = pickUrlFromFile(file);
    const p = await requireProfile(userId);
    if (!p.galleryPhotos || index < 0 || index >= p.galleryPhotos.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid photo index');
    }
    p.galleryPhotos[index] = media;
    await p.save();
    return p;
  },

  async deletePhoto(userId: UserId, index: number) {
    const p = await requireProfile(userId);
    if (!p.galleryPhotos || index < 0 || index >= p.galleryPhotos.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid photo index');
    }
    p.galleryPhotos.splice(index, 1);
    await p.save();
    return p;
  },
};
