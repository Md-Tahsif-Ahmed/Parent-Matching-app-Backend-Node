// src/app/modules/match/match.service.ts (তোমার ফাইলে যে path আছে সেটাই)
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import { LikeModel } from './like.model';
import { BlockModel } from '../block/block.model';
import { ConversationModel } from '../conversation/conversation.model';
import { SLOT_LIMIT, DEFAULT_COOLING_DAYS, pairKeyOf } from './types';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { emitToUser } from '../../../helpers/realtime';
import { MessageModel } from '../message/message.model';

type ObjId = Types.ObjectId | string;

async function isBlocked(a: ObjId, b: ObjId) {
  const cnt = await BlockModel.countDocuments({ $or: [{ by: a, user: b }, { by: b, user: a }] });
  return cnt > 0;
}

export const MatchService = {
  // LIKE: create/update like; if reciprocal, ensure conversation exists and notify both
  async like(me: ObjId, target: ObjId) {
    console.log("++++++", me, target);
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

    const wasCreated = !raw?.lastErrorObject?.updatedExisting;   // newly inserted
    const prevType   = raw?.value?.type;                         // previous type if existed
    const transitionedToLike = wasCreated || prevType !== 'LIKE';

    // Check reciprocal
    const hasReciprocal = await LikeModel.exists({ from: target, to: me, type: 'LIKE' });

    if (!hasReciprocal) {
      // ✅ Non-reciprocal case:
      // - Realtime ping (only once when newly LIKE’d)
      // - Persisted notification so offline user also sees it later
      if (transitionedToLike) {
        try {
          emitToUser(String(target), 'like:inbound', { from: String(me) });
        } catch {}

        // Persisted notif (sender populated in NotificationService.getNotificationFromDB)
        await sendNotifications({
          text: "Someone liked your profile ❤️",
          receiver: target,
          referenceId: String(me),   // you may use senderId here for deep-linking to profile
          screen: "CHAT",            // keeping "CHAT" for consistency with your schema
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
      text: "It's a match! Say hello 👋",
      receiver: target,
      referenceId: String(conv._id),
      screen: "CHAT",
      read: false,
      sender: me,
    });
    await sendNotifications({
      text: "It's a match! Say hello 👋",
      receiver: me,
      referenceId: String(conv._id),
      screen: "CHAT",
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

  // Start chat: check my ACTIVE slots and set me ACTIVE
  async startChat(me: ObjId, convId: string) {
    const conv = await ConversationModel.findById(convId);
    if (!conv) throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');

    const mePart = conv.participants.find((p) => String(p.user) === String(me));
    if (!mePart) throw new ApiError(StatusCodes.FORBIDDEN, 'Not a participant');

    // idempotency guard
    const alreadyActive = mePart.state === 'ACTIVE';

    const myActive = await ConversationModel.countDocuments({
      'participants.user': me,
      'participants.state': 'ACTIVE'
    });
    if (myActive >= SLOT_LIMIT)
      throw new ApiError(StatusCodes.CONFLICT, 'ACTIVE_LIMIT_REACHED');

    mePart.state = 'ACTIVE';
    await conv.save();

    const other = conv.participants.find(p => String(p.user) !== String(me));

    // Persisted notification to other
    if (other) {
      await sendNotifications({
        text: "Chat started. You can now exchange messages.",
        receiver: other.user,
        referenceId: String(conv._id),
        screen: "CHAT",
        read: false,
        sender: me,
      });
    } 

    //  massage create in massage table
    // *************
       // --- NEW: persist a "start chat" system message once ---
   if (!alreadyActive) {
     // ডুপ্লিকেট এড়াতে আগেরটা আছে কিনা দেখে নেই (টেক্সট ট্যাগ দিয়ে)
    const TAG = '__SYSTEM_START_CHAT__';
     const exists = await MessageModel.exists({ conv: conv._id, text: TAG });
      if (!exists) {
       const msg = await MessageModel.create({
         conv: conv._id,
         from: me as any,        // চাইলে এখানে আলাদা system user ব্যবহার করতে পারো
         text: TAG,              // UI চাইলে এই TAG-কে "Chat started" হিসেবে রেন্ডার করবে
          files: [],
       });
       try {
         // রিয়েলটাইমে পুশ—meta যথেষ্ট; বড় পে-লোড নেই
         emitToUser(String(me), 'chat:message', {
           convId: String(conv._id),
           from: String(me),
          text: TAG,
           createdAt: msg.createdAt,
         });
         if (other) {
           emitToUser(String(other.user), 'chat:message', {
            convId: String(conv._id),
           from: String(me),
             text: TAG,
            createdAt: msg.createdAt,
          });
        }
      } catch {}
    }
  }


    // *************

    // Realtime state push
    try {
      if (other) {
        emitToUser(String(other.user), 'chat:state', { convId: String(conv._id), by: String(me), state: 'ACTIVE' });
      }
      emitToUser(String(me), 'chat:state', { convId: String(conv._id), by: String(me), state: 'ACTIVE' });
    } catch {}

    return conv;
  }
};

