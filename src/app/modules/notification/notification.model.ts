import { Schema, model } from 'mongoose';
import { INotification } from './notification.interface';

const NotificationSchema = new Schema<INotification>(
  {
    text: { type: String, required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    read: { type: Boolean, default: false },
    referenceId: { type: String, required: false },
    screen: { type: String, enum: ['MATCH', 'CHAT'], required: false },
    type: { type: String, required: false },
    // ADD sender so populate(...) works
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true }
);

export const Notification = model<INotification>('Notification', NotificationSchema);
