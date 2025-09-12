import { Schema, model } from "mongoose";
import { IMessage } from "./message.interface";

const AttachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    mime: String,
    size: Number,
    name: String,
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    conv: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    files: { type: [AttachmentSchema], default: [] },

       // NEW: delivered = create time, seen = null
    deliveredAt: { type: Date, default: Date.now },
    seenAt: { type: Date, default: null },
  },
   
  { timestamps: true }
);

// Helpful indexes
MessageSchema.index({ conv: 1, createdAt: 1 });
MessageSchema.index({ conv: 1, seenAt: 1 });

export const MessageModel = model<IMessage>("Message", MessageSchema);
export default MessageModel;
