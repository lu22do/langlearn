import mongoose, { Schema, Document } from "mongoose";
import { LANGUAGES, type LanguageCode } from "../../shared/constants/languages";

export interface ISettings extends Document {
  userId?: string;
  baseLanguageCode: LanguageCode;
  UILanguageCode: LanguageCode;
  learningLanguageCode: LanguageCode;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    userId: { type: String, unique: true, sparse: true },
    baseLanguageCode: { 
      type: String, 
      required: true, 
      default: "en",
      enum: LANGUAGES.map(l => l.code)
    },
    UILanguageCode: { 
      type: String, 
      required: true, 
      default: "en",
      enum: LANGUAGES.map(l => l.code)
    },
    learningLanguageCode: { 
      type: String, 
      required: true, 
      default: "de",
      enum: LANGUAGES.map(l => l.code)
    },
  },
  { timestamps: true }
);

settingsSchema.index({ userId: 1 }, { unique: true, sparse: true });

export default mongoose.model<ISettings>("Settings", settingsSchema);