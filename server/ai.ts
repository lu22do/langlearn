import OpenAI from "openai";
import { getLanguageName } from "../shared/constants/languages.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AnalysisResult {
  contextualExplanation: string;
  examples: Array<{ example: string; translation: string }>;
  explanations: string; // various meanings, grammar points, etc...
  translation: string;
}

export async function analyzeSnippet(
  text: string,
  context: string,
  learningLanguageCode: string,
  baseLanguageCode: string
): Promise<AnalysisResult> {
  const learning_language = getLanguageName(learningLanguageCode) || learningLanguageCode;
  const base_language = getLanguageName(baseLanguageCode) || baseLanguageCode;

  // First call: Get structured JSON data
  const jsonResponse = await client.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: `You are a language learning assistant. Analyze ${learning_language} text and provide structured data in ${base_language}.`,
      },
      {
        role: "user",
        content: `Analyze this ${learning_language} text:

Text: "${text}"
Context: "${context}"

Provide:
1. Contextual meaning of the text in the given context (or most common meaning if context is insufficient)
2. 3-4 example sentences in ${learning_language} with ${base_language} translations
3. ${base_language} translation of the text`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "language_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            contextualExplanation: {
              type: "string",
              description: "Contextual meaning of the text"
            },
            examples: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  example: { type: "string" },
                  translation: { type: "string" }
                },
                required: ["example", "translation"],
                additionalProperties: false
              },
              description: "3-4 example sentences with translations"
            },
            translation: {
              type: "string",
              description: "Translation to base language"
            }
          },
          required: ["contextualExplanation", "examples", "translation"],
          additionalProperties: false
        }
      }
    }
  });

  const jsonContent = jsonResponse.choices[0].message.content;
  if (!jsonContent) {
    throw new Error("No JSON content received from OpenAI");
  }
  const parsedJson = JSON.parse(jsonContent);

  // Second call: Get markdown explanation
  const markdownResponse = await client.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: `You are a language learning assistant. Provide detailed explanations in markdown format.`,
      },
      {
        role: "user",
        content: `Provide a detailed markdown explanation for this ${learning_language} text: "${text}"

Include:
- All possible meanings
- Grammar points and structure
- Usage notes
- Additional examples with explanations`,
      },
    ],
  });

  const markdownContent = markdownResponse.choices[0].message.content;
  if (!markdownContent) {
    throw new Error("No markdown content received from OpenAI");
  }

  return {
    contextualExplanation: parsedJson.contextualExplanation,
    examples: parsedJson.examples,
    explanations: markdownContent,
    translation: parsedJson.translation,
  };
}