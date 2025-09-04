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
  },
  { timestamps: true }
);

export const MessageModel = model<IMessage>("Message", MessageSchema);
