import colors from "colors";
import { Server } from "socket.io";
import { logger } from "../shared/logger";
import jwt from "jsonwebtoken";

const socket = (io: Server)=>{
    io.on('connection', socket=>{
        logger.info(colors.blue('A User connected'));

        // --- auto-join user room from handshake (token or query) ---
        try {
          const token = (socket.handshake.auth && (socket.handshake.auth as any).token)
            || ((socket.handshake.headers && (socket.handshake.headers.authorization || '')?.split(' ')[1]) as string | undefined)
            || (socket.handshake.query && (socket.handshake.query as any).token);

          let userId: string | undefined;
          if (token && process.env.JWT_SECRET) {
            try {
              const payload = jwt.verify(token as string, process.env.JWT_SECRET) as any;
              userId = payload?.id;
            } catch {}
          }
          if (!userId && (socket.handshake.query && (socket.handshake.query as any).userId)) {
            userId = String((socket.handshake.query as any).userId);
          }
          if (userId) {
            socket.join(`user:${userId}`);
            socket.data.userId = userId;
            logger.info(colors.green(`auto-joined room user:${userId}`));
          }
        } catch (e) {
          logger.info(colors.yellow('user auto-join failed'));
        }
        // ---------------------------------------------------------

        // Join user-level room (call after login) - kept for backward-compat
        socket.on("user:join", ({ userId }: { userId: string }) => {
            if (!userId) return;
            socket.join(`user:${userId}`);
            logger.info(colors.green(`joined room user:${userId}`));
        });

        // Join/leave conversation room
        socket.on("conv:join", ({ convId }: { convId: string }) => {
            if (!convId) return;
            socket.join(`conv:${convId}`);
            logger.info(colors.green(`joined room conv:${convId}`));
        });
        socket.on("conv:leave", ({ convId }: { convId: string }) => {
            if (!convId) return;
            socket.leave(`conv:${convId}`);
            logger.info(colors.yellow(`left room conv:${convId}`));
        });

        // disconnect
        socket.on("disconnect", ()=>{
            logger.info(colors.red('A user disconnect'));
        })
    })
}

export const socketHelper = { socket }