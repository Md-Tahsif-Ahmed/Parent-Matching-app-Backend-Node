export enum USER_ROLES {
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
    USER = 'USER',
}


export const CHAT_STATUS = { ACTIVE:'ACTIVE', ARCHIVED:'ARCHIVED', CLOSED:'CLOSED' } as const;
export const MATCH_STATUS = { MATCHED:'MATCHED', BLOCKED:'BLOCKED', UNMATCHED:'UNMATCHED' } as const;
export const MSG_TYPE = { TEXT:'TEXT', IMAGE:'IMAGE', FILE:'FILE' } as const;
export const JOURNEY = { IN_NEED:'IN_NEED', STABLE:'STABLE', MENTOR:'MENTOR' } as const;
export const REACTION = { LIKE:'LIKE', PASS:'PASS' } as const;
export type ChatStatus = keyof typeof CHAT_STATUS;
export type MsgType = keyof typeof MSG_TYPE;