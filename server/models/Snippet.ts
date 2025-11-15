import mongoose, { Schema, Document } from "mongoose";

export interface ISnippet extends Document {
  rawText: string;
  lemma?: string;
  partOfSpeech?: string;
  languageCode: string;
  sourceContext: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  difficulty?: number;
  nextReview?: Date;
  reviewCount?: number;
}

const snippetSchema = new Schema<ISnippet>(
  {
    rawText: { type: String, required: true, maxlength: 500 },
    lemma: { type: String, maxlength: 500 },
    partOfSpeech: { type: String, maxlength: 50 },
    languageCode: { type: String, required: true, default: "en" },
    sourceContext: { type: String, required: true, maxlength: 20000 },
    tags: { type: [String], default: [] },
    userId: { type: String },
    difficulty: { type: Number, min: 0, max: 1, default: 0.5 },
    nextReview: { type: Date },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

snippetSchema.index({ userId: 1, createdAt: -1 });
snippetSchema.index({ languageCode: 1 });

export default mongoose.model<ISnippet>("Snippet", snippetSchema);