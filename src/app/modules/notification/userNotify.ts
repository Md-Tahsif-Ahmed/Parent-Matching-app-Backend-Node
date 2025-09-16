import { Types } from "mongoose";
import { Notification } from "./notification.model";

type ObjId = Types.ObjectId | string;

export async function notifyUser(receiver: ObjId, text: string, opts?: { referenceId?: string; screen?: "MATCH"| "LIKE" | "CHAT"; sender?: ObjId }) {
  try {
    await Notification.create({
      text,
      receiver: receiver as any,
      referenceId: opts?.referenceId,
      screen: opts?.screen,
      read: false,
      // @ts-ignore
      sender: opts?.sender as any,
    } as any);
  } catch {/* ignore */}
}
