import * as dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { errorLogger, logger } from "./shared/logger";
import colors from 'colors';
import { socketHelper } from "./helpers/socketHelper";
import { Server } from "socket.io";
import seedSuperAdmin from "./DB";

process.on('uncaughtException', err => {
  errorLogger.error('uncaughtException Detected', err);
  process.exit(1);
});

let server: any;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    logger.info(colors.green('Database connected successfully'));

    await seedSuperAdmin();

    const port = Number(config.port);
    server = app.listen(port, config.ip_address as string, () => {
      logger.info(colors.yellow(`Application listening on port:${config.port}`));
    });

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: { origin: '*' }
    });
    socketHelper.socket(io);
    // @ts-ignore
    global.io = io;

  } catch (error) {
    errorLogger.error(colors.red('Startup failed'), error);
    process.exit(1);
  }

  process.on('unhandledRejection', err => {
    if (server) {
      server.close(() => {
        errorLogger.error('UnhandledRejection Detected', err);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main();

process.on('SIGTERM', () => {
  logger.info('SIGTERM IS RECEIVED');
  if (server) server.close();
});
