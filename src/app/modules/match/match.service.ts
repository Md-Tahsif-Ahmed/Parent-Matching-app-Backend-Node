// src/app/modules/match/match.service.ts 
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import { LikeModel } from './like.model';
import { BlockModel } from '../block/block.model';
import { ConversationModel } from '../conversation/conversation.model';
import { SLOT_LIMIT, DEFAULT_COOLING_DAYS, pairKeyOf } from './types';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { emitToUser } from '../../../helpers/realtime';

type ObjId = Types.ObjectId | string;

async function isBlocked(a: ObjId, b: ObjId) {
  const cnt = await BlockModel.countDocuments({ $or: [{ by: a, user: b }, { by: b, user: a }] });
  return cnt > 0;
}

export const MatchService = {
  // LIKE: create/update like; if reciprocal, ensure conversation exists and notify both
  async like(me: ObjId, target: ObjId) {
    if (String(me) === String(target))
      throw new ApiError(StatusCodes.BAD_REQUEST, 'SELF_LIKE_NOT_ALLOWED');

    if (await isBlocked(me, target))
      throw new ApiError(StatusCodes.FORBIDDEN, 'BLOCKED');

    // ---- Upsert LIKE + detect if this is a NEW like or a transition to LIKE (e.g., PASS -> LIKE)
    const raw: any = await LikeModel.findOneAndUpdate(
      { from: me, to: target },
      { $set: { type: 'LIKE', expiresAt: null } },
      {
        upsert: true,
        new: false,              // return the PRE-UPDATE doc
        rawResult: true,         // to read lastErrorObject.updatedExisting
        setDefaultsOnInsert: true,
      }
    );

    const wasCreated = !raw?.lastErrorObject?.updatedExisting;  
    const prevType   = raw?.value?.type;   
    const transitionedToLike = wasCreated || prevType !== 'LIKE';

    // Check reciprocal
    const hasReciprocal = await LikeModel.exists({ from: target, to: me, type: 'LIKE' });

    if (!hasReciprocal) {
   
      // - Realtime ping (only once when newly LIKE’d)
      // - Persisted notification so offline user also sees it later
      if (transitionedToLike) {
        try {
          emitToUser(String(target), 'like:inbound', { from: String(me) });
        } catch {}

        // Persisted notif (sender populated in NotificationService.getNotificationFromDB)
        await sendNotifications({
          text: "Someone Liked you!",
          receiver: target,
          referenceId: String(me),  
          screen: "LIKE",           
          read: false,
          sender: me,
        });
      }
      return { matched: false };
    }

    // ---- Reciprocal: ensure conversation and notify both (unchanged)
    const key = pairKeyOf(String(me), String(target));
    let conv = await ConversationModel.findOne({ pairKey: key });
    if (!conv) {
      conv = await ConversationModel.create({
        pairKey: key,
        participants: [
          { user: me,     state: 'PENDING' },
          { user: target, state: 'PENDING' },
        ],
        lastMessageAt: null,
      });
    }

    // Persisted notif to both
    await sendNotifications({
      text: "You have one new match!",
      receiver: target,
      referenceId: String(conv._id),
      screen: "MATCH",
      read: false,
      sender: me,
    });
    await sendNotifications({
      text: "You have one new match!",
      receiver: me,
      referenceId: String(conv._id),
      screen: "MATCH",
      read: false,
      sender: target,
    });

    // Realtime match events
    try {
      emitToUser(String(me),     'match:new', { convId: String(conv._id), with: String(target) });
      emitToUser(String(target), 'match:new', { convId: String(conv._id), with: String(me) });
    } catch {}

    return { matched: true, convId: String(conv._id) };
  },

  /// PASS with cooling-off window
  async pass(me: ObjId, target: ObjId, days?: number) {
    if (String(me) === String(target))
      throw new ApiError(StatusCodes.BAD_REQUEST, 'SELF_PASS_NOT_ALLOWED');

    if (await isBlocked(me, target))
      throw new ApiError(StatusCodes.FORBIDDEN, 'BLOCKED');

    const d = Math.max(1, Math.min(30, Number(days) || DEFAULT_COOLING_DAYS));
    const expiresAt = new Date(Date.now() + d*24*60*60*1000);

    await LikeModel.updateOne(
      { from: me, to: target },
      { $set: { type: 'PASS', expiresAt } },
      { upsert: true }
    );

    return { ok: true, expiresAt };
  },
 

};

