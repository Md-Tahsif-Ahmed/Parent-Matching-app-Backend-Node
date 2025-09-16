// src/app/modules/notification/notification.service.ts
import { JwtPayload } from "jsonwebtoken";
import { Notification } from "./notification.model";

type ListOpts = { page?: number; limit?: number };

export const NotificationService = {
  // USER: list notifications (populated sender)
  async getNotificationFromDB(user: JwtPayload, opts: ListOpts = {}) {
    const page  = Math.max(1, Number(opts.page || 1));
    const limit = Math.min(100, Math.max(1, Number(opts.limit || 20)));
    const skip  = (page - 1) * limit;

    //  user.id or user.sub (for different token types)
    const userId = (user as any)?.id || (user as any)?.sub;

    const [items, total, unreadCount] = await Promise.all([
      Notification.find({ receiver: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("text screen referenceId read createdAt sender")  
        .populate({ path: "sender", select: "name profile _id" })
        .lean({ virtuals: true }),
      Notification.countDocuments({ receiver: userId }),
      Notification.countDocuments({ receiver: userId, read: false }),
    ]);

    return {
      items,            // Array<{ ..., sender: { _id, name, profile } }>
      total,
      unreadCount,
      page,
      pageCount: Math.ceil(total / limit),
    };
  },

  // USER: mark all as read
  async readNotificationToDB(user: JwtPayload) {
    const userId = (user as any)?.id || (user as any)?.sub;
    const res = await Notification.updateMany(
      { receiver: userId, read: false },
      { $set: { read: true } }
    );
    return { modified: res.modifiedCount ?? 0 };
  },

  // ADMIN:
  // async adminNotificationFromDB() {
  //   return Notification.find({ type: "ADMIN" })
  //     .sort({ createdAt: -1 })
  //     .lean();
  // },

  // async adminReadNotificationToDB() {
  //   const res = await Notification.updateMany(
  //     { type: "ADMIN", read: false },
  //     { $set: { read: true } }
  //   );
  //   return { modified: res.modifiedCount ?? 0 };
  // },
};
