import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  userId?: string;
  baseLanguageCode: string; // Language for translations (e.g., "en")
  UILanguageCode: string; // Language for the UI (e.g., "en")
  learningLanguageCode: string; // Language being learned (e.g., "de")
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    userId: { type: String, unique: true, sparse: true },
    baseLanguageCode: { type: String, required: true, default: "en" },
    UILanguageCode: { type: String, required: true, default: "en" },
    learningLanguageCode: { type: String, required: true, default: "de" },
  },
  { timestamps: true }
);

// Ensure we only have one settings document per user (or one global if no userId)
settingsSchema.index({ userId: 1 }, { unique: true, sparse: true });

export default mongoose.model<ISettings>("Settings", settingsSchema);