import { Types } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { ConversationModel } from "../conversation/conversation.model";
import { MessageModel } from "./message.model";
// import { sendNotifications } from "../../../helpers/notificationsHelper";
import { emitToConv, emitToUser } from "../../../helpers/realtime";
import { SLOT_LIMIT } from "../match/types";

type ObjId = Types.ObjectId | string;
 

export const MessageService = {
  // SEND: deliveredAt 
  async send(me: ObjId, convId: string, text?: string, files?: any[]) {
    const conv = await ConversationModel.findById(convId);
    if (!conv)
      throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");

    const mePart = conv.participants.find((p) => String(p.user) === String(me));
    if (!mePart) throw new ApiError(StatusCodes.FORBIDDEN, "Not a participant");

    const otherPart = conv.participants.find((p) => String(p.user) !== String(me));

    // fistmessage: active , if slot not full
    if (mePart.state !== "ACTIVE") {
      const myActive = await ConversationModel.countDocuments({
        "participants.user": me,
        "participants.state": "ACTIVE",
      });
      if (myActive >= SLOT_LIMIT) {
        throw new ApiError(StatusCodes.CONFLICT, "ACTIVE_LIMIT_REACHED");
      }
      mePart.state = "ACTIVE";
      await conv.save();
    }

    // ❗️Disallow: ARCHIVED/BLOCKED state
    const states = [mePart.state, otherPart?.state];
    if (states.includes("ARCHIVED") || states.includes("BLOCKED")) {
      throw new ApiError(StatusCodes.FORBIDDEN, "CHAT_NOT_ALLOWED");
    }

    const hasText  = typeof text === "string" && text.trim().length > 0;
    const hasFiles = Array.isArray(files) && files.length > 0;
    if (!hasText && !hasFiles) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "EMPTY_MESSAGE");
    }

    const now = new Date();
    const msg = await MessageModel.create({
      conv: conv._id,
      from: me as any,
      ...(hasText ? { text: text!.trim() } : {}),
      ...(hasFiles ? { files } : {}),
      deliveredAt: now,          
      
    });

    conv.lastMessageAt = now;
    await conv.save();

    // Push/Notif
    // if (otherPart) {
    //   await sendNotifications({
    //     text: hasText ? text!.slice(0, 140) : "Sent an attachment",
    //     receiver: otherPart.user,
    //     referenceId: String(conv._id),
    //     screen: "CHAT",
    //     read: false,
    //     sender: me,
    //   });
    // }

    // Realtime emit
    try {
      emitToConv(String(conv._id), "chat:message", {
        id: String(msg._id),
        convId: String(conv._id),
        from: String(me),
        text: hasText ? text!.trim() : undefined,
        files: hasFiles ? files : undefined,
        createdAt: msg.createdAt ?? now,
        deliveredAt: msg.deliveredAt ?? now,    
        seenAt: msg.seenAt ?? null,
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

  // LIST 
  async list(me: ObjId, convId: string, limit = 50) {
    const conv = await ConversationModel.findById(convId);
    if (!conv) throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");

    const mePart = conv.participants.find((p) => String(p.user) === String(me));
    if (!mePart) throw new ApiError(StatusCodes.FORBIDDEN, "Not a participant");

    const items = await MessageModel.find({ conv: convId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return items.reverse();
  },

  // if open new chat, then not-seen chat will  bulk seen
  // async markSeen(me: ObjId, convId: string) {
  //   const conv = await ConversationModel.findById(convId);
  //   if (!conv) throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");

  //   const mePart = conv.participants.find((p) => String(p.user) === String(me));
  //   if (!mePart) throw new ApiError(StatusCodes.FORBIDDEN, "Not a participant");

  //   const now = new Date();
  //   const res = await MessageModel.updateMany(
  //     {
  //       conv: convId,
  //       from: { $ne: me },
  //       $or: [{ seenAt: { $exists: false } }, { seenAt: null }],
  //     },
  //     { $set: { seenAt: now } }
  //   );

  //   //  Realtime emit for seen messages
  //   try {
  //     if ((res as any).modifiedCount > 0) {
  //       emitToConv(String(conv._id), "chat:seen", {
  //         convId: String(conv._id),
  //         seenAt: now,
  //       });
  //     }
  //   } catch {}

  //   return { seenAt: now, count: (res as any).modifiedCount ?? 0 };
  // },

async markSeen(me: ObjId, convId: string) {
  const conv = await ConversationModel.findById(convId);
  if (!conv) throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");

  const mePart = conv.participants.find(p => String(p.user) === String(me));
  if (!mePart) throw new ApiError(StatusCodes.FORBIDDEN, "Not a participant");

  const now = new Date();

  // Update only messages from others that are not yet seen.
  const res = await MessageModel.updateMany(
    { conv: convId, from: { $ne: me }, seenAt: { $eq: null } },
    { $set: { seenAt: now } }
  );

  let lastSeenAt: Date | null = null;

  if (res.modifiedCount > 0) {
    // we just marked unseen → seen now
    lastSeenAt = now;

    try {
      emitToConv(String(conv._id), "chat:seen", {
        convId: String(conv._id),
        seenAt: now,
      });
    } catch {}
  } else {
    // nothing new to mark; return the LATEST seenAt (not earliest)
    const lastSeenMsg = await MessageModel.findOne({
      conv: convId,
      from: { $ne: me },
      seenAt: { $ne: null },
    })
      .sort({ seenAt: -1 })
      .select("seenAt");

    lastSeenAt = lastSeenMsg?.seenAt ?? null;
  }

  return { seenAt: lastSeenAt, count: res.modifiedCount ?? 0 };
}


};
