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

import { INotification } from "../app/modules/notification/notification.interface";
import { Notification } from "../app/modules/notification/notification.model";
import { Server } from "socket.io";

export const sendNotifications = async (data:any):Promise<INotification> =>{
    const result = await Notification.create(data);

    //@ts-ignore
    const io = global.io as Server | undefined;

    if (io) {
        // Legacy pattern (kept for back-compat)
        io.emit(`get-notification::${data?.receiver}`, result);
        // Room-targeted modern pattern
        io.to(`user:${data?.receiver}`).emit("notif:new", result);
    }

    return result;
}