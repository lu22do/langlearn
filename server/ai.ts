import OpenAI from "openai";
import { getLanguageName } from "../shared/constants/languages.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

interface AnalysisResult {
  contextualExplanation: string;
  examples: Array<{ example: string; translation: string }>;
  explanations: string; // various meanings, grammar points, etc...
  translation: string;
}

export interface QuizQuestion {
  rawText: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
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
    model: OPENAI_MODEL,
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
    model: OPENAI_MODEL,
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

export async function generateQuiz(
  snippets: Array<{ rawText: string; languageCode?: string; sourceContext?: string }>,
  uiLanguageCode: string,
  format: "multiple_choice" | "fill_in_blank" = "multiple_choice",
  numChoices = 4
): Promise<QuizQuestion[]> {
  if (!snippets || snippets.length === 0) return [];

  const ui_language = getLanguageName(uiLanguageCode) || uiLanguageCode;

  // Build prompt
  const payload = snippets
    .map((s, i) => `#${i + 1} (${s.languageCode || "unknown"}): ${s.rawText}`)
    .join("\n\n");

  const userPrompt = `Create a quiz of ${snippets.length} ${format} questions based on the following snippets. Respond with a JSON object containing a single property "questions" which is an array of objects. Each object should contain: rawText, question (in ${ui_language}), choices (array of ${numChoices} strings), answerIndex (0-based), and a short explanation (in ${ui_language}).\n\nSnippets:\n${payload}\n\nRules:\n- For multiple_choice, provide exactly ${numChoices} choices and ensure one is correct.\n- Keep questions concise and learner-focused.\n- Make distractors plausible and similar in meaning to the correct answer.`;

  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: `You are a language learning quiz author. Generate concise quiz questions in ${ui_language}.` },
      { role: "user", content: userPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "quiz_generation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  rawText: { type: "string" },
                  question: { type: "string" },
                  choices: {
                    type: "array",
                    items: { type: "string" }
                  },
                  answerIndex: { type: "number" },
                  explanation: { type: "string" }
                },
                required: ["rawText", "question", "choices", "answerIndex", "explanation"],
                additionalProperties: false
              }
            }
          },
          required: ["questions"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content from quiz generation");

  return parseQuizContent(content);
}

export function parseQuizContent(c: string): QuizQuestion[] {
  let p: any;
  try {
    p = JSON.parse(c);
  } catch (err) {
    const match = c.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (match) {
      try {
        p = JSON.parse(match[1]);
      } catch (e) {
        throw new Error("Could not parse quiz generation response (inner JSON)");
      }
    } else {
      throw new Error("Could not parse quiz generation response");
    }
  }

  // Support either { questions: [...] } (preferred) or fallback to array
  if (Array.isArray(p)) return p as QuizQuestion[];
  if (p && Array.isArray(p.questions)) return p.questions as QuizQuestion[];
  if (p && Array.isArray(p.quiz)) return p.quiz as QuizQuestion[]; // alternate key

  throw new Error("Quiz response JSON does not contain questions array");
}