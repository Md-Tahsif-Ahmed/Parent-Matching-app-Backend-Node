// import { INotification } from "../app/modules/notification/notification.interface";
// import { Notification } from "../app/modules/notification/notification.model";


// export const sendNotifications = async (data:any):Promise<INotification> =>{

//     const result = await Notification.create(data);

//     //@ts-ignore
//     const socketIo = global.io;

//     if (socketIo) {
//         socketIo.emit(`get-notification::${data?.receiver}`, result);
//     }

//     return result;
// }

// import { INotification } from "../app/modules/notification/notification.interface";
// import { Notification } from "../app/modules/notification/notification.model";
// import { Server } from "socket.io";

// export const sendNotifications = async (data:any):Promise<INotification> =>{
//     const result = await Notification.create(data);

//     //@ts-ignore
//     const io = global.io as Server | undefined;

//     if (io) {
//         // Legacy pattern (kept for back-compat)
//         io.emit(`get-notification::${data?.receiver}`, result);
//         // Room-targeted modern pattern
//         io.to(`user:${data?.receiver}`).emit("notif:new", result);
//     }

//     return result;
// }


// src/helpers/notificationsHelper.ts
import { INotification } from "../app/modules/notification/notification.interface";
import { Notification } from "../app/modules/notification/notification.model";
import { Server } from "socket.io";

export const sendNotifications = async (data: any): Promise<INotification> => {
  const doc = await Notification.create(data);

  // populate sender so clients get { sender: { _id, name, profile } } in realtime
  let populated = doc as any;
  try {
    populated = await doc.populate({ path: "sender", select: "name profile _id" });
  } catch (e) {
    // populate failed (schema mismatch) — fall back to raw doc
  }

  // @ts-ignore
  const io = global.io as Server | undefined;
  if (io) {
    // Legacy (back-compat)
    io.emit(`get-notification::${data?.receiver}`, populated);
    // Room-targeted modern
    io.to(`user:${data?.receiver}`).emit("notif:new", populated);
  }

  // সার্ভিস রিটার্নেও populate থাকা ভালো
  return populated as any;
};
