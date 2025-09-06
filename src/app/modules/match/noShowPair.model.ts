import { Schema, model } from "mongoose";

const NoShowPairSchema = new Schema(
  {
    a: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    b: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reason: { type: String, enum: ["ARCHIVED", "BLOCKED", "MANUAL"], required: true },
    at: { type: Date, default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

// ensure uniqueness per pair (directional; we usually write both directions)
NoShowPairSchema.index({ a: 1, b: 1 }, { unique: true });

export const NoShowPairModel = model("NoShowPair", NoShowPairSchema);
