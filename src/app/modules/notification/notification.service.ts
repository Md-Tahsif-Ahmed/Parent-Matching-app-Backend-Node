// src/app/modules/notification/notification.service.ts
import { JwtPayload } from "jsonwebtoken";
import { Notification } from "./notification.model";

type ListOpts = { page?: number; limit?: number };

export const NotificationService = {
  // USER: list notifications (populated sender)
  async getNotificationFromDB(user: JwtPayload, opts: ListOpts = {}) {
    const page = Math.max(1, Number(opts.page || 1));
    const limit = Math.min(100, Math.max(1, Number(opts.limit || 20)));
    const skip = (page - 1) * limit;

    //  user.id or user.sub (for different token types)
    const userId = (user as any)?.id || (user as any)?.sub;

    const [rows, total, unreadCount] = await Promise.all([
      Notification.find({ receiver: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("text screen receiver referenceId read createdAt sender")
        .populate({
          path: "sender",  
          select: "name _id",  
          populate: {
            path: "profile", // virtual on User -> Profile
            select: "childDOB location diagnosis", 
          },
        })
        .lean({ virtuals: true }),
      Notification.countDocuments({ receiver: userId }),
      Notification.countDocuments({ receiver: userId, read: false }),
    ]);

    const items = rows.map((n: any) => {
    const p = n?.sender?.profile;
    if (p) {
      if (!p.childAge && p.childDOB) {
  
        const diffYM = (from: Date, to: Date) => {
          const f = new Date(from.getFullYear(), from.getMonth(), from.getDate());
          const t = new Date(to.getFullYear(),   to.getMonth(),   to.getDate());
          let totalMonths = (t.getFullYear() - f.getFullYear()) * 12 + (t.getMonth() - f.getMonth());
          if (t.getDate() < f.getDate()) totalMonths -= 1;
          const years  = Math.max(0, Math.floor(totalMonths / 12));
          const months = Math.max(0, totalMonths % 12);
          return { years, months, totalMonths: Math.max(0, totalMonths) };
        };
        p.childAge = diffYM(new Date(p.childDOB), new Date());
      }
      delete p.childDOB;
    }
    return n;
  });

    return {
      items,
      total,
      unreadCount,
      page,
      pageCount: Math.ceil(total / limit),
    };
  },

    async readOneNotificationToDB(user: JwtPayload, notificationId: string) {
    const userId = (user as any)?.id || (user as any)?.sub;

    const res = await Notification.updateOne(
      { _id: notificationId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    // Idempotent response (don’t 404 if already read or not found)
    return {
      modified: res.modifiedCount ?? 0,
      id: notificationId,
    };
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
