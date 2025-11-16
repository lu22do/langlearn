export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
] as const;

export type LanguageCode = typeof LANGUAGES[number]["code"];

export function getLanguageName(code: string): string | undefined {
  return LANGUAGES.find(lang => lang.code === code)?.name;
}