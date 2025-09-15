import { Types } from 'mongoose';
import { BlockModel } from './block.model';
import { ConversationModel } from '../conversation/conversation.model';

type ObjId = Types.ObjectId | string;

export const BlockService = {
  async block(me: ObjId, target: ObjId) {
    await BlockModel.updateOne(
      { by: me, user: target },
      { $set: { by: me, user: target } },
      { upsert: true }
    );
    // mark conversation blocked (both sides)
    const pairKey = [String(me), String(target)].sort().join('::');
    const conv = await ConversationModel.findOne({ pairKey });
    if (conv) {
      conv.participants.forEach(p => p.state = 'BLOCKED');
      await conv.save();
    }
    return { blocked: true };
  },
  async unblock(me: ObjId, target: ObjId) {
    await BlockModel.deleteOne({ by: me, user: target });
    return { blocked: false };
  },

  async listMine(me: ObjId, page = 1, limit = 20) {
    const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1);

    const [items, total] = await Promise.all([
      BlockModel.find({ by: me })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
        path: 'user',
        select: '_id name',  
        options: { lean: true }  
      } ).lean(),
      BlockModel.countDocuments({ by: me }),
    ]);

    return {
      items, // [{ _id, by, user: { _id, name}, createdAt, ... }]
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  },
};
