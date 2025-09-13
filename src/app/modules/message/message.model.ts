// src/modules/message/message.model.ts
import { Schema, model } from "mongoose";
import { IMessage } from "./message.interface";

// 👇 OPTIONAL CLEANUP: ডিলিটের সময় ডিস্ক থেকে ফাইল মুছতে লাগবে
import fs from "fs/promises";
import path from "path";

const UPLOAD_ROOT = process.env.UPLOAD_ROOT || path.resolve(process.cwd(), "uploads");
const UPLOAD_ROOT_RESOLVED = path.resolve(UPLOAD_ROOT) + path.sep;

async function deleteMessageFiles(doc: Pick<IMessage, "files"> | null | undefined) {
  if (!doc?.files?.length) return;
  for (const f of doc.files) {
    const url = typeof (f as any)?.url === "string" ? (f as any).url : "";
    if (!url.startsWith("/uploads/")) continue;                 // শুধু আমাদের স্ট্যাটিক path
    const rel = url.replace(/^\/uploads\//, "");
    const abs = path.join(UPLOAD_ROOT, rel);
    const absResolved = path.resolve(abs);

    // নিরাপদ গার্ড: UPLOAD_ROOT এর বাইরে হলে কখনই unlink করব না
    if (!absResolved.startsWith(UPLOAD_ROOT_RESOLVED)) continue;

    try { await fs.unlink(absResolved); } catch { /* ignore */ }
  }
}

const AttachmentSchema = new Schema(
  {
    url: { type: String, required: true }, // expected: /uploads/...
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

/**  ✅ OPTIONAL CLEANUP HOOKS (ডিলিটে ফাইল মুছবে)  **/
MessageSchema.post("findOneAndDelete", async function (doc: any) {
  try { await deleteMessageFiles(doc); } catch { /* ignore */ }
});

MessageSchema.post("deleteOne", { document: true, query: false }, async function (res: any) {
  try { await deleteMessageFiles(this as any); } catch { /* ignore */ }
});

// চাইলে bulk delete কভার করতে পারেন:
// MessageSchema.pre("deleteMany", async function () {
//   const docs = await this.model.find(this.getFilter(), { files: 1 }).lean();
//   (this as any)._filesToDelete = docs;
// });
// MessageSchema.post("deleteMany", async function () {
//   const docs = (this as any)._filesToDelete as Array<Pick<IMessage, "files">> | undefined;
//   if (docs?.length) for (const d of docs) await deleteMessageFiles(d);
// });

export const MessageModel = model<IMessage>("Message", MessageSchema);
export default MessageModel;
