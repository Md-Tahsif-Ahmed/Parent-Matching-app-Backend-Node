import { Server } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var io: Server | undefined;
}

function getIO(): Server {
  const io = (global as any).io as Server | undefined;
  if (!io) throw new Error("Socket.IO not initialized on global.io");
  return io;
}

export function emitToUser(userId: string, event: string, payload: any) {
  getIO().to(`user:${userId}`).emit(event, payload);
}

export function emitToConv(convId: string, event: string, payload: any) {
  getIO().to(`conv:${convId}`).emit(event, payload);
}
