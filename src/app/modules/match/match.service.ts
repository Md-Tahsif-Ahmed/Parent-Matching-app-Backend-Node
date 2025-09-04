import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import { LikeModel } from './like.model';
import { BlockModel } from '../block/block.model';
import { ConversationModel } from '../conversation/conversation.model';
import { SLOT_LIMIT, DEFAULT_COOLING_DAYS, pairKeyOf } from './types';

type ObjId = Types.ObjectId | string;

async function isBlocked(a: ObjId, b: ObjId) {
  const cnt = await BlockModel.countDocuments({ $or: [{by:a,user:b},{by:b,user:a}] });
  return cnt > 0;
}

export const MatchService = {
  async like(me: ObjId, target: ObjId) {
    if (String(me) === String(target))
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot like yourself');
    if (await isBlocked(me, target))
      throw new ApiError(StatusCodes.FORBIDDEN, 'Blocked');

    await LikeModel.updateOne(
      { from: me, to: target },
      { $set:{ type:'LIKE' }, $unset:{ expiresAt:1 } },
      { upsert: true }
    );

    const rec = await LikeModel.findOne({ from: target, to: me, type:'LIKE' });
    if (!rec) return { matched:false };

    const pairKey = pairKeyOf(String(me), String(target));
    let conv = await ConversationModel.findOne({ pairKey });
    if (!conv) {
      conv = await ConversationModel.create({
        pairKey,
        participants: [
          { user: me as any,    state: 'PENDING' },
          { user: target as any,state: 'PENDING' }
        ]
      } as any);
    }
    return { matched:true, convId: conv._id };
  },

  async pass(me: ObjId, target: ObjId, days?: number) {
    if (String(me) === String(target))
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot pass yourself');
    const ms = (days ?? DEFAULT_COOLING_DAYS) * 24*60*60*1000;
    const expiresAt = new Date(Date.now() + ms);
    await LikeModel.updateOne(
      { from: me, to: target },
      { $set:{ type:'PASS', expiresAt } },
      { upsert: true }
    );
    return { coolingOffUntil: expiresAt };
  },

  async startChat(me: ObjId, convId: string) {
    const conv = await ConversationModel.findById(convId);
    if (!conv) throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
    const mePart = conv.participants.find(p => String(p.user) === String(me));
    if (!mePart) throw new ApiError(StatusCodes.FORBIDDEN, 'Not a participant');

    const myActive = await ConversationModel.countDocuments({
      'participants.user': me,
      'participants.state': 'ACTIVE'
    });
    if (myActive >= SLOT_LIMIT)
      throw new ApiError(StatusCodes.CONFLICT, 'ACTIVE_LIMIT_REACHED');

    mePart.state = 'ACTIVE';
    await conv.save();
    return conv;
  }
};
