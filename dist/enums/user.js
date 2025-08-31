"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REACTION = exports.JOURNEY = exports.MSG_TYPE = exports.MATCH_STATUS = exports.CHAT_STATUS = exports.USER_ROLES = void 0;
var USER_ROLES;
(function (USER_ROLES) {
    USER_ROLES["ADMIN"] = "ADMIN";
    USER_ROLES["SUPER_ADMIN"] = "SUPER_ADMIN";
    USER_ROLES["USER"] = "USER";
})(USER_ROLES || (exports.USER_ROLES = USER_ROLES = {}));
exports.CHAT_STATUS = { ACTIVE: 'ACTIVE', ARCHIVED: 'ARCHIVED', CLOSED: 'CLOSED' };
exports.MATCH_STATUS = { MATCHED: 'MATCHED', BLOCKED: 'BLOCKED', UNMATCHED: 'UNMATCHED' };
exports.MSG_TYPE = { TEXT: 'TEXT', IMAGE: 'IMAGE', FILE: 'FILE' };
exports.JOURNEY = { IN_NEED: 'IN_NEED', STABLE: 'STABLE', MENTOR: 'MENTOR' };
exports.REACTION = { LIKE: 'LIKE', PASS: 'PASS' };
