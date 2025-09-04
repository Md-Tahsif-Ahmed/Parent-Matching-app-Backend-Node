import { Types } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { ConversationModel } from "../conversation/conversation.model";
import { MessageModel } from "./message.model";

type ObjId = Types.ObjectId | string;

export const MessageService = {
  async send(me: ObjId, convId: string, text?: string, files?: any[]) {
    const conv = await ConversationModel.findById(convId);
    if (!conv)
      throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");

    const mePart = conv.participants.find((p) => String(p.user) === String(me));
    if (!mePart) throw new ApiError(StatusCodes.FORBIDDEN, "Not a participant");
    if (mePart.state !== "ACTIVE")
      throw new ApiError(StatusCodes.CONFLICT, "CHAT_NOT_ACTIVE");

    const msg = await MessageModel.create({
      conv: conv._id,
      from: me,
      text,
      files: files || [],
    } as any);
    conv.lastMessageAt = new Date();
    await conv.save();

    // TODO: socket emit to the other participant
    return msg;
  },

  async list(me: ObjId, convId: string, limit = 50) {
    const conv = await ConversationModel.findById(convId);
    if (!conv)
      throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");

    const mePart = conv.participants.find((p) => String(p.user) === String(me));
    if (!mePart) throw new ApiError(StatusCodes.FORBIDDEN, "Not a participant");

    const items = await MessageModel.find({ conv: convId })
      .sort({ createdAt: -1 })
      .limit(limit);
    return items.reverse();
  },
};
