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
  baseLanguageCode: string,
  uiLanguageCode: string
): Promise<AnalysisResult> {
  const learning_language = getLanguageName(learningLanguageCode) || learningLanguageCode;
  const base_language = getLanguageName(baseLanguageCode) || baseLanguageCode;
  const ui_language = getLanguageName(uiLanguageCode) || uiLanguageCode;

  // Small helper to strip triple-backtick fences from markdown responses
  const stripCodeFences = (s: string) => {
    if (!s) return s;
    let out = s.trim();
    if (!out.startsWith("```")) return out;
    const firstNewline = out.indexOf('\n');
    if (firstNewline !== -1) out = out.substring(firstNewline + 1);
    else out = out.replace(/^```.*?\n?/, "");
    if (out.endsWith("```")) out = out.substring(0, out.length - 3);
    return out.trim();
  };

  // Prepare both requests and execute them in parallel to reduce latency
  const jsonPromise = client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `You are a language learning assistant. Analyze the ${learning_language} text language and provide structured data in ${ui_language} language`,
      },
      {
        role: "user",
        content: `Analyze this ${learning_language} text:

Text_to_explain: "${text}"
Context: "${context}"

Provide:
1. Contextual meaning of the Text_to_explain in the given Context (or most common meaning if context is insufficient) in ${ui_language}
2. 3-4 example sentences in ${learning_language} with ${base_language} translations
3. ${base_language} translation of the Text_to_explain`,
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

  const markdownPromise = client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `You are a language learning assistant. Provide detailed explanations in raw markdown format in ${ui_language} language. Do NOT wrap the response in triple-backtick fences.`,
      },
      {
        role: "user",
        content: `Provide a detailed explanation for this ${learning_language} text: "${text}" in ${ui_language} language. Return only markdown content (no surrounding code fences).

Include:
- All possible meanings
- Grammar points and structure
- Usage notes
- Additional examples with explanations`,
      },
    ],
  });

  const [jsonResponse, markdownResponse] = await Promise.all([jsonPromise, markdownPromise]);

  // Parse JSON result (fallback to extracting fenced JSON if necessary)
  const jsonContent = jsonResponse.choices?.[0]?.message?.content;
  if (!jsonContent) throw new Error("No JSON content received from OpenAI");

  let parsedJson;
  try {
    parsedJson = JSON.parse(jsonContent);
  } catch (err) {
    const match = jsonContent.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (match) parsedJson = JSON.parse(match[1]);
    else throw new Error("Unable to parse JSON content from OpenAI response");
  }

  // Normalize markdown result
  let markdownContent = markdownResponse.choices?.[0]?.message?.content;
  if (!markdownContent) throw new Error("No markdown content received from OpenAI");
  markdownContent = stripCodeFences(markdownContent);

  return {
    contextualExplanation: parsedJson.contextualExplanation,
    examples: parsedJson.examples,
    explanations: markdownContent,
    translation: parsedJson.translation,
  };
}