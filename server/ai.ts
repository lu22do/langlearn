import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AnalysisResult {
  examples: string[];
  explanations: string[]; // various meanings, grammar points, etc...
  translation: string;
}

export async function analyzeSnippet(
  text: string,
  context: string,
  learningLanguageCode: string,
  baseLanguageCode: string
): Promise<AnalysisResult> {
  const learning_language = convertLanguageCodeToLanguage(learningLanguageCode);
  const base_language = convertLanguageCodeToLanguage(baseLanguageCode);

  const prompt = `You are a language learning assistant. Analyze the following ${learning_language} text and provide a comprehensive learning breakdown.

Text: "${text}"
Context: "${context}"

Please provide:
1. Contextual meaning of the text in the context where it was found. If the context is the same as the text or the context is insufficient, go for the most common meaning.
2. 3-4 example sentences for the most common usages (in ${learning_language} with ${base_language} translations).
3. Each meaning with explanations about the structure, words, or usage and a set examples.
4. ${base_language} translation.

Format your response as JSON with this structure:
{
  "contextualExplanation": "...",
  "examples": [
    {"example": "...", "translation": "..."}, 
    {"example": "...", "translation": "..."}, 
    {"example": "...", "translation": "..."}
  ],
  "explanations": ["...", "...", "...", "..."],
  "translation": "...",
}

For example, for the text "lustig" in German in the context of "etwas lustig zu machen", the response could look like this:
{
  "contextualExplanation": "In this context of 'etwas lustig zu machen', 'lustig' translates to funny, indicating that the action involves adding humor to a situation or event.",
  "examples": [
    {"example": "Der Lehrer wollte den Unterricht etwas lustig machen.", "translation": "The teacher wanted to make the lesson a bit funny."},
    {"example": "Die Komödie war so lustig, dass wir alle laut gelacht haben.", "translation": "The comedy was so funny that we all laughed out loud."},
    {"example": "Kannst du das etwas lustig machen, damit es interessanter wird?", "translation": "Can you make it a bit funny so that it becomes more interesting?"}
  ],
  "explanations": [
    "'Lustig' generally means 'funny' or 'amusing.' It is used to describe something that causes laughter or entertainment. The word operates as an adjective in sentences, modifying nouns.",
    "The phrase 'etwas lustig machen' implies the act of introducing humor into a situation. Here, 'etwas' means 'something,' 'lustig' means 'funny,' and 'machen' means 'to make.' It demonstrates an action focused on transforming a serious or bland context into a humorous experience.",
    "'Lustig' can also pertain to a person's character or behavior, suggesting that someone is humorous or light-hearted. For example, 'Er ist sehr lustig' means 'He is very funny.'"
  ],
  "translation": "funny"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful language learning assistant. Always respond with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content);
}

interface FlashcardSuggestion {
  front: string;
  back: string;
}

export async function generateFlashcards(
  snippet: string,
  translation: string,
  language: string
): Promise<FlashcardSuggestion[]> {
  const prompt = `Based on this ${language} snippet and its translation, generate 2-3 useful flashcards for learning.

Snippet: "${snippet}"
Translation: "${translation}"

Create flashcards that help learn:
- The main phrase/sentence
- Key vocabulary words
- Important grammar patterns

Format as JSON:
{
  "flashcards": [
    {"front": "${language} text", "back": "English meaning"},
    {"front": "${language} text", "back": "English meaning"}
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a language learning assistant creating flashcards. Always respond with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const result = JSON.parse(content);
  return result.flashcards;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function generateQuiz(
  snippet: string,
  translation: string,
  grammar: string[],
  language: string
): Promise<QuizQuestion> {
  const prompt = `Create a multiple-choice quiz question based on this ${language} learning material:

Snippet: "${snippet}"
Translation: "${translation}"
Grammar points: ${grammar.join("; ")}

Create ONE quiz question that tests understanding of:
- Translation/meaning
- Grammar usage
- Vocabulary

Provide 4 options with only one correct answer.

Format as JSON:
{
  "question": "...",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": 0,
  "explanation": "Brief explanation of the correct answer"
}

correctAnswer should be the index (0-3) of the correct option.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a language learning assistant creating quiz questions. Always respond with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content);
}

function convertLanguageCodeToLanguage(languageCode: string): string {
  const languageMap: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'pl': 'Polish',
    'tr': 'Turkish',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'id': 'Indonesian',
    'he': 'Hebrew',
  };

  return languageMap[languageCode] || languageCode;
}

