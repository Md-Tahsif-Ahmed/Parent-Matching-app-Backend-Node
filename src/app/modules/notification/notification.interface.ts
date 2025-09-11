import { Model, Types } from 'mongoose';

export type INotification = {
    text: string;
    receiver?: Types.ObjectId;
    read: boolean;
    referenceId?: string;
    screen?: "MATCH" | "CHAT";
    type?: "ADMIN";
    sender?: Types.ObjectId | string;
};

export type NotificationModel = Model<INotification>;