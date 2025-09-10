import colors from "colors";
import { Server } from "socket.io";
import { logger } from "../shared/logger";

const socket = (io: Server)=>{
    io.on('connection', socket=>{
        logger.info(colors.blue('A User connected'));

        // Join user-level room (call after login)
        // client: socket.emit('user:join', { userId })
        socket.on("user:join", ({ userId }: { userId: string }) => {
            if (!userId) return;
            socket.join(`user:${userId}`);
            logger.info(colors.green(`joined room user:${userId}`));
        });

        // Join/leave conversation room
        // client: socket.emit('conv:join', { convId })
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