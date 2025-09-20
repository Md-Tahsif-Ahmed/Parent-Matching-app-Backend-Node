// src/app/modules/profile/profile.completion.ts

import { IProfile } from "../app/modules/profile/profile.interface";

 

const WEIGHTS = {
  aboutMe: 5,
  childDOB: 5,
  journeyName: 5,
  interests: 10,
  values: 5,
  diagnosis: 15,
  therapy: 10,
  location: 10,
  profilePicture: 10,
  galleryPerPhoto: 2.5,   
  galleryMaxPhotos: 4, 
  consentAt: 15,
} as const;

export function computeProfileCompletion(p: IProfile): number {
  let score = 0;

  if (p.aboutMe?.trim()) score += WEIGHTS.aboutMe;
  if (p.childDOB) score += WEIGHTS.childDOB;
  if (p.journeyName?.trim()) score += WEIGHTS.journeyName;
  if ((p.interests?.length || 0) > 0) score += WEIGHTS.interests;
  if ((p.values?.length || 0) > 0) score += WEIGHTS.values;

  if (p.diagnosis?.name?.trim()) score += WEIGHTS.diagnosis;
  if (p.therapy?.name?.trim()) score += WEIGHTS.therapy;

  if (p.location?.type === 'Point' && Array.isArray(p.location.coordinates) && p.location.coordinates.length === 2) {
    score += WEIGHTS.location;
  }

  if (p.profilePicture?.url) score += WEIGHTS.profilePicture;

  // per photo in gallery, incrementally up to max
  const gCount = Math.min(p.galleryPhotos?.length || 0, WEIGHTS.galleryMaxPhotos);
  score += gCount * WEIGHTS.galleryPerPhoto;

  if (p.consentAt) score += WEIGHTS.consentAt;

  // one-decimal precision  if needed
  score = Number(score.toFixed(1));
  if (score < 0) score = 0;
  if (score > 100) score = 100;
  return score;
}
