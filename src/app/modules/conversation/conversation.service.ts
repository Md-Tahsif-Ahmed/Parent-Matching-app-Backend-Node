import { Types } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { ConversationModel } from "./conversation.model";
import { NoShowPairModel } from "../match/noShowPair.model";
import { emitToUser } from "../../../helpers/realtime";
 

type ObjId = Types.ObjectId | string;

export const ConversationService = {
  async archive(me: ObjId, convId: string) {
    const conv = await ConversationModel.findById(convId);
    if (!conv)
      throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");

    const mePart = conv.participants.find((p) => String(p.user) === String(me));
    if (!mePart) throw new ApiError(StatusCodes.FORBIDDEN, "Not a participant");

    // both sides ARCHIVED
    conv.participants.forEach((p) => (p.state = "ARCHIVED"));
    await conv.save();

    // permanent no-show edges (both directions)
    try {
      const a = conv.participants[0]?.user;
      const b = conv.participants[1]?.user;
      if (a && b) {
        await NoShowPairModel.insertMany(
          [
            { a, b, reason: "ARCHIVED", at: new Date() },
            { a: b, b: a, reason: "ARCHIVED", at: new Date() },
          ],
          { ordered: false }
        );
      }
    } catch {}

    // realtime update
    try {
      for (const p of conv.participants) {
        emitToUser(String(p.user), "chat:archived", { convId: String(conv._id) });
      }
    } catch {}

    return conv;
  },

  async myList(me: ObjId) {
    return await ConversationModel.find({
      "participants.user": me,
      "participants.state": { $in: ["ACTIVE", "PENDING", "ARCHIVED"] },
    }).sort({ updatedAt: -1 });
  },

  async recentMatches(me: ObjId) {
    return await ConversationModel.find({ "participants.user": me })
      .sort({ createdAt: -1 })
      .limit(50);
  },
};
