// profile.service.ts
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import { Profile } from './profile.model';
import unlinkFile from '../../../shared/unlinkFile';
import { IFileMeta, IProfile } from './profile.interface';

type UserId = string | Types.ObjectId;

 

const requireProfile = async (userId: UserId) => {
  const profile = await Profile.findOne({ user: userId });
  if (!profile) throw new ApiError(StatusCodes.NOT_FOUND, 'Profile not found');
  return profile;
};

const me = async (userId: UserId) => {
  return await Profile.findOne({ user: userId });
};

 

// NEW: aboutMe only
const setAboutMe = async (userId: UserId, aboutMe: string) => {
  const p = await Profile.findOneAndUpdate(
    { user: userId },
    { $set: { aboutMe: aboutMe?.trim?.() ?? '' } },
    { new: true, upsert: true }
  );
  return p;
};

// NEW: childAge only
const setChildAge = async (userId: UserId, childAge: number) => {
  const p = await Profile.findOneAndUpdate(
    { user: userId },
    { $set: { childAge } },
    { new: true, upsert: true }
  );
  return p;
};

const setJourney = async (userId: UserId, journeyName: string) => {
  const p = await Profile.findOneAndUpdate(
    { user: userId },
    { $set: { journeyName } },
    { new: true, upsert: true }
  );
  return p;
};

const setInterestsValues = async (userId: UserId, interests?: string[], values?: string[]) => {
  const update: any = {};
  if (interests) update.interests = interests;
  if (values) update.values = values;
  const p = await Profile.findOneAndUpdate(
    { user: userId },
    { $set: update },
    { new: true, upsert: true }
  );
  return p;
};

const setDiagnoses = async (userId: UserId, items: Array<{ typeName?: string; name: string }>) => {
  const bad = items.find(it => !it.name || it.name.trim().length === 0);
  if (bad) throw new ApiError(StatusCodes.BAD_REQUEST, 'Each diagnosis must contain a name');
  const p = await Profile.findOneAndUpdate(
    { user: userId },
    { $set: { diagnoses: items } },
    { new: true, upsert: true }
  );
  return p;
};

const setTherapies = async (userId: UserId, items: Array<{ typeName?: string; name: string }>) => {
  const bad = items.find(it => !it.name || it.name.trim().length === 0);
  if (bad) throw new ApiError(StatusCodes.BAD_REQUEST, 'Each therapy must contain a name');
  const p = await Profile.findOneAndUpdate(
    { user: userId },
    { $set: { therapies: items } },
    { new: true, upsert: true }
  );
  return p;
};

const setLocation = async (userId: UserId, lat: number, lng: number, locationText?: string) => {
  const update: any = {
    location: { type: 'Point', coordinates: [lng, lat] },
  };
  if (locationText) update.locationText = locationText;
  const p = await Profile.findOneAndUpdate(
    { user: userId },
    { $set: update },
    { new: true, upsert: true }
  );
  return p;
};

const setConsent = async (userId: UserId) => {
  const p = await Profile.findOneAndUpdate(
    { user: userId },
    { $set: { consentAt: new Date() } },
    { new: true, upsert: true }
  );
  return p;
};

const uploadProfilePicture = async (
  userId: UserId,
  file: Express.Multer.File
): Promise<IProfile> => {
  if (!file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'File is required (key: "image")');
  }

  // new file meta from multer
  const newMeta: IFileMeta = {
    url: `/images/${file.filename}`,
    mime: file.mimetype,
    size: file.size,
  };

  // user profile খুঁজে বের করো (না থাকলে তৈরি করো)
  let profile = await Profile.findOne({ user: userId });

  if (!profile) {
    profile = await Profile.create({
      user: userId,
      profilePicture: newMeta,
    } as Partial<IProfile>);
    return profile;
  }

  // আগে যদি profilePicture থেকে থাকে—ফাইল unlink করো
  if (profile.profilePicture?.url) {
    unlinkFile(profile.profilePicture.url); // leading slash handle করে এমন unlinkFile ব্যবহার করো
  }

  profile.profilePicture = newMeta;
  await profile.save();

  return profile;
};

const addPhoto = async (userId: UserId, file: Express.Multer.File): Promise<IProfile> => {
  if (!file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'File is required (key: "image")');
  }

  const newMeta: IFileMeta = {
    url: `/images/${file.filename}`,
    mime: file.mimetype,
    size: file.size,
  };

  // find or create profile
  let profile = await Profile.findOne({ user: userId });
  if (!profile) {
    profile = await Profile.create({
      user: userId,
      galleryPhotos: [newMeta],
    } as Partial<IProfile>);
    return profile;
  }

  if ((profile.galleryPhotos?.length || 0) >= 4) {
    throw new ApiError(StatusCodes.CONFLICT, 'PHOTO_LIMIT_REACHED');
  }
  if (!profile.galleryPhotos) profile.galleryPhotos = [] as any;
  (profile.galleryPhotos as any).push(newMeta);
  await profile.save();
  return profile;
};

const addPhotos = async (userId: UserId, files: Express.Multer.File[]): Promise<IProfile> => {
  if (!files || files.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Files are required (key: "image")');
  }

  // map to IFileMeta
  const metas: IFileMeta[] = files.map(f => ({
    url: `/images/${f.filename}`,
    mime: f.mimetype,
    size: f.size,
  }));

  // find or create profile
  let profile = await Profile.findOne({ user: userId });
  if (!profile) {
    if (metas.length > 4) {
      throw new ApiError(StatusCodes.CONFLICT, 'PHOTO_LIMIT_REACHED');
    }
    profile = await Profile.create({
      user: userId,
      galleryPhotos: metas,
    } as Partial<IProfile>);
    return profile;
  }

  const existingCount = (profile.galleryPhotos?.length || 0);
  if (existingCount + metas.length > 4) {
    throw new ApiError(StatusCodes.CONFLICT, 'PHOTO_LIMIT_REACHED');
  }

  if (!profile.galleryPhotos) profile.galleryPhotos = [] as any;
  (profile.galleryPhotos as IFileMeta[]).push(...metas);
  await profile.save();
  return profile;
};

// replace photo at index with uploaded file
const replacePhoto = async (userId: UserId, index: number, file: Express.Multer.File): Promise<IProfile> => {
  if (!file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'File is required (key: "image")');
  }

  const newMeta: IFileMeta = {
    url: `/images/${file.filename}`,
    mime: file.mimetype,
    size: file.size,
  };

  const profile = await requireProfile(userId);

  if (!profile.galleryPhotos || index < 0 || index >= profile.galleryPhotos.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid photo index');
  }

  // unlink existing file if present
  const old = profile.galleryPhotos[index];
  if (old?.url) {
    try { unlinkFile(old.url); } catch (e) { /* non-fatal, continue */ }
  }

  (profile.galleryPhotos as any)[index] = newMeta;
  await profile.save();
  return profile;
};

// delete photo at index and unlink file
const deletePhoto = async (userId: UserId, index: number): Promise<IProfile> => {
  const profile = await requireProfile(userId);

  if (!profile.galleryPhotos || index < 0 || index >= profile.galleryPhotos.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid photo index');
  }

  const [removed] = profile.galleryPhotos.splice(index, 1);
  if (removed?.url) {
    try { unlinkFile(removed.url); } catch (e) { /* non-fatal, continue */ }
  }

  await profile.save();
  return profile;
};

export const ProfileService = {
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
  addPhotos,
  replacePhoto,
  deletePhoto,
};
