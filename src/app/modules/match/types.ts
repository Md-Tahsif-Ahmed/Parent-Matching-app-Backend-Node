export type LikeType = 'LIKE' | 'PASS';
export type ParticipantState = 'ACTIVE' | 'PENDING' | 'ARCHIVED' | 'BLOCKED';

export const SLOT_LIMIT = 3;
export const DEFAULT_COOLING_DAYS = 7;

export const pairKeyOf = (a: string, b: string) =>
  [String(a), String(b)].sort().join('::');
