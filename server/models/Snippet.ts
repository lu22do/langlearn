import mongoose, { Schema, Document } from "mongoose";

export interface ExampleWithTranslation {
  example: string;
  translation: string;
}

// Interface for GenAI-generated data on the snippet
export interface SnippetAnalysis {
  contextualExplanation?: string;       // Explanation in the context (markdown formatted)
  examples?: ExampleWithTranslation[];
  explanations?: string;                // Detailed explanations (markdown formatted)
  translation?: string;
  lemma?: string;                       // the base form of the snippet (e.g. "run" for "ran")
  partOfSpeech?: string;                // the part of speech of the snippet (e.g. "verb", "noun")
}

// Interface for raw snippet as entered by the user + accounting information
export interface ISnippet extends Document, SnippetAnalysis {
  rawText: string;        // the snippet itself
  languageCode: string;   // the language code of the snippet (the learning language or set by the user)
  sourceContext: string;  // the prompt in which the snippet appeared
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  difficulty?: number;
  nextReview?: Date;
  reviewCount?: number;
}

// Database schema for the snippet
const snippetSchema = new Schema<ISnippet>(
  {
    rawText: { type: String, required: true, maxlength: 500 },
    languageCode: { type: String, required: true, default: "en" },
    sourceContext: { type: String, required: true, maxlength: 20000 },
    userId: { type: String },
    difficulty: { type: Number, min: 0, max: 1, default: 0.5 },
    nextReview: { type: Date },
    reviewCount: { type: Number, default: 0 },
    contextualExplanation: { type: String },
    examples: { 
      type: [{
        example: { type: String, required: true },
        translation: { type: String, required: true }
      }],
      default: []
    },
    explanations: { type: String },
    translation: { type: String },
    lemma: { type: String, maxlength: 500 },
    partOfSpeech: { type: String, maxlength: 50 },
  },
  { timestamps: true }
);

snippetSchema.index({ userId: 1, createdAt: -1 });
snippetSchema.index({ languageCode: 1 });

export default mongoose.model<ISnippet>("Snippet", snippetSchema);