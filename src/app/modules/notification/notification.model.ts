import { Schema, model } from 'mongoose';
import { INotification } from './notification.interface';

const NotificationSchema = new Schema<INotification>(
  {
    text: { type: String, required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    read: { type: Boolean, default: false },
    referenceId: { type: String, required: false },
    screen: { type: String, enum: ['MATCH','LIKE','CHAT'], required: false },
    // type: { type: String, required: false },
    // ADD sender so populate(...) works
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ receiver: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ receiver: 1, referenceId: 1, read: 1 });


export const Notification = model<INotification>('Notification', NotificationSchema);
