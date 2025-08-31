"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const message_model_1 = require("./message.model");
const sendMessageToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // save to DB
    const response = yield message_model_1.Message.create(payload);
    //@ts-ignore
    const io = global.io;
    if (io) {
        io.emit(`getMessage::${payload === null || payload === void 0 ? void 0 : payload.chatId}`, response);
    }
    return response;
});
const getMessageFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield message_model_1.Message.find({ chatId: id })
        .sort({ createdAt: -1 });
    return messages;
});
exports.MessageService = { sendMessageToDB, getMessageFromDB };
