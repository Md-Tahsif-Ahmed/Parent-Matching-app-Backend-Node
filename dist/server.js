"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const logger_1 = require("./shared/logger");
const colors_1 = __importDefault(require("colors"));
const socketHelper_1 = require("./helpers/socketHelper");
const socket_io_1 = require("socket.io");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
//uncaught exception
process.on('uncaughtException', error => {
    logger_1.errorLogger.error('uncaughtException Detected', error);
    process.exit(1);
});
let server;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // remove cluster fromt his code
            // create super admin
            // seedSuperAdmin();
            mongoose_1.default.connect(config_1.default.database_url);
            logger_1.logger.info(colors_1.default.green('🚀 Database connected successfully'));
            const port = typeof config_1.default.port === 'number' ? config_1.default.port : Number(config_1.default.port);
            server = app_1.default.listen(port, config_1.default.ip_address, () => {
                logger_1.logger.info(colors_1.default.yellow(`♻️  Application listening on port:${config_1.default.port}`));
            });
            //socket
            const io = new socket_io_1.Server(server, {
                pingTimeout: 60000,
                cors: {
                    origin: '*'
                }
            });
            socketHelper_1.socketHelper.socket(io);
            //@ts-ignore
            global.io = io;
        }
        catch (error) {
            logger_1.errorLogger.error(colors_1.default.red('🤢 Failed to connect Database'));
            process.exit(1);
        }
        //handle unhandledRejection
        process.on('unhandledRejection', error => {
            if (server) {
                server.close(() => {
                    logger_1.errorLogger.error('UnhandledRejection Detected', error);
                    process.exit(1);
                });
            }
            else {
                process.exit(1);
            }
        });
    });
}
main();
//SIGTERM
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM IS RECEIVE');
    if (server) {
        server.close();
    }
});
