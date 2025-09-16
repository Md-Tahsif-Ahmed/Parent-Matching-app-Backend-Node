import mongoose, { Types } from "mongoose";
import { BlockModel } from "./block.model";
import { ConversationModel } from "../conversation/conversation.model";

type ObjId = Types.ObjectId | string;

export const BlockService = {
  // BLOCK: BLOCKED both sides
  async block(me: ObjId, target: ObjId) {
    if (String(me) === String(target)) {
      throw new Error("You cannot block yourself");
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // 1) block edge upsert
        await BlockModel.updateOne(
          { by: me, user: target },
          { $set: { by: me, user: target } },
          { upsert: true, session }
        );

        // 2) conversation state -> BLOCKED (both)
        const pairKey = [String(me), String(target)].sort().join("::");
        await ConversationModel.updateOne(
          { pairKey },
          { $set: { "participants.$[].state": "BLOCKED" } },
          { session }
        );
      });
    } finally {
      session.endSession();
    }
    return { blocked: true };
  },

  //  UNBLOCK
  async unblock(me: ObjId, target: ObjId) {
    const meId = new Types.ObjectId(String(me));
    const targetId = new Types.ObjectId(String(target));

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // 1) block edge delete
        await BlockModel.deleteOne({ by: me, user: target }, { session });

        // 2) conversation state -> UNBLOCK or UNBLOCK/BLOCKED
        //    (depends on whether the other side still blocks you)
        const otherStillBlocks = await BlockModel.exists({
          by: target as any,
          user: me as any,
        }).session(session);

        const pairKey = [String(me), String(target)].sort().join("::");

        if (otherStillBlocks) {
          //3a) other side still blocks you ⇒ just UNBLOCK yourself
          await ConversationModel.updateOne(
            { pairKey },
            { $set: { "participants.$[me].state": "UNBLOCK" } },
            {
              arrayFilters: [{ "me.user": meId }],
              session,
            }
          );
        } else {
          // 3b) no block edge in either direction ⇒ UNBLOCK both sides
          await ConversationModel.updateOne(
            { pairKey },
            {
              $set: {
                "participants.$[me].state": "UNBLOCK",
                "participants.$[other].state": "UNBLOCK",
              },
            },
            {
              arrayFilters: [{ "me.user": meId }, { "other.user": targetId }],
              session,
            }
          );
        }
      });
    } finally {
      session.endSession();
    }
    return { blocked: false };
  },

  // LIST MINE
  async listMine(me: ObjId, page = 1, limit = 20) {
    const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1);

    const [items, total] = await Promise.all([
      BlockModel.find({ by: me })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "user",
          select: "_id name",
          populate: { path: "profile", select: "profilePicture.url" },
        })
        .lean({ virtuals: true }),
      BlockModel.countDocuments({ by: me }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  },
};
