import { Types } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { ConversationModel } from "./conversation.model";

type ObjId = Types.ObjectId | string;

export const ConversationService = {
  async archive(me: ObjId, convId: string) {
    const conv = await ConversationModel.findById(convId);
    if (!conv)
      throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");

    const mePart = conv.participants.find((p) => String(p.user) === String(me));
    if (!mePart) throw new ApiError(StatusCodes.FORBIDDEN, "Not a participant");

    mePart.state = "ARCHIVED";
    await conv.save();
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
