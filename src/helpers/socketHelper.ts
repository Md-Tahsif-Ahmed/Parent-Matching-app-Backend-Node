// src/helpers/socketHelper.ts
import colors from "colors";
import { Server } from "socket.io";
import { logger } from "../shared/logger";
import jwt from "jsonwebtoken";
import config from "../config";

const socket = (io: Server) => {
  io.on("connection", (socket) => {
    logger.info(colors.blue("A user connected"));

    // Auto-join from token (header/query/auth)
    try {
      const bearer =
        (socket.handshake.auth as any)?.token ||
        (socket.handshake.headers?.authorization || "").split(" ")[1] ||
        (socket.handshake.query as any)?.token;

      if (bearer) {
        const decoded: any = jwt.verify(bearer, config.jwt.secret as string);
        const uid = decoded?.id || decoded?._id || decoded?.userId;
        if (uid) {
          socket.join(`user:${uid}`);
          logger.info(colors.green(`joined user room -> user:${uid}`));
        }
      }
    } catch {
      logger.warn(colors.yellow("socket token verify failed"));
    }

    // Fallback: manual join (current code)
    socket.on("user:join", ({ userId }: { userId: string }) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      logger.info(colors.green(`joined room user:${userId}`));
    });

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

    socket.on("disconnect", () => {
      logger.info(colors.red("A user disconnect"));
    });
  });
};

export const socketHelper = { socket };
