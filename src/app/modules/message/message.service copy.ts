import { Types } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { ConversationModel } from "../conversation/conversation.model";
import { MessageModel } from "./message.model";
import { sendNotifications } from "../../../helpers/notificationsHelper";
import { emitToConv, emitToUser } from "../../../helpers/realtime";
import { SLOT_LIMIT } from "../match/types";


type ObjId = Types.ObjectId | string;

export const MessageService = {
 
  async send(me: ObjId, convId: string, text?: string, files?: any[]) {
    const conv = await ConversationModel.findById(convId);
    if (!conv)
      throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");

    const mePart = conv.participants.find((p) => String(p.user) === String(me));
    if (!mePart) throw new ApiError(StatusCodes.FORBIDDEN, "Not a participant");

    const otherPart = conv.participants.find((p) => String(p.user) !== String(me));

    // ✅ প্রথম মেসেজেই ACTIVE (slot ফাঁকা থাকলে)
    if (mePart.state !== "ACTIVE") {
      const myActive = await ConversationModel.countDocuments({
        "participants.user": me,
        "participants.state": "ACTIVE",
      });
      if (myActive >= SLOT_LIMIT) {
        // UI চাইলে এখান থেকে "একটা চ্যাট archive করে আবার চেষ্টা করো" মেসেজ দেখাবে
        throw new ApiError(StatusCodes.CONFLICT, "ACTIVE_LIMIT_REACHED");
      }
      mePart.state = "ACTIVE";
      await conv.save();
    }

    // ❗️Send disallow rules: আগের মতোই
    const states = [mePart.state, otherPart?.state];
    if (states.includes("ARCHIVED") || states.includes("BLOCKED")) {
      throw new ApiError(StatusCodes.FORBIDDEN, "CHAT_NOT_ALLOWED");
    }

    const hasText  = typeof text === "string" && text.trim().length > 0;
    const hasFiles = Array.isArray(files) && files.length > 0;
    if (!hasText && !hasFiles) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "EMPTY_MESSAGE");
    }

    const msg = await MessageModel.create({
      conv: conv._id,
      from: me as any,
      ...(hasText ? { text: text!.trim() } : {}),
      ...(hasFiles ? { files } : {}),
    });

    conv.lastMessageAt = new Date();
    await conv.save();

    if (otherPart) {
      await sendNotifications({
        text: hasText ? text!.slice(0, 140) : "Sent an attachment",
        receiver: otherPart.user,
        referenceId: String(conv._id),
        screen: "CHAT",
        read: false,
        sender: me,
      });
    }

    try {
      emitToConv(String(conv._id), "chat:message", {
        convId: String(conv._id),
        from: String(me),
        text: hasText ? text!.trim() : undefined,
        files: hasFiles ? files : undefined,
        createdAt: new Date(),
      });
      if (otherPart) {
        emitToUser(String(otherPart.user), "notif:new", {
          kind: "message",
          convId: String(conv._id),
          from: String(me),
          preview: hasText ? text!.slice(0, 60) : "Attachment",
        });
      }
    } catch {}

    return msg;
  },



  async list(me: ObjId, convId: string, limit = 50) {
    const conv = await ConversationModel.findById(convId);
    if (!conv) throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");

    const mePart = conv.participants.find((p) => String(p.user) === String(me));
    if (!mePart) throw new ApiError(StatusCodes.FORBIDDEN, "Not a participant");

    const items = await MessageModel.find({ conv: convId }).sort({ createdAt: -1 }).limit(limit);
    return items.reverse();
  },
};


