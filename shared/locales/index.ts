import { en } from "./en";
import { de } from "./de";
import { fr } from "./fr";
import { ja } from "./ja";
import type { LanguageCode } from "../constants/languages";

export const translations = {
  en,
  de,
  fr,
  ja,
} as const;

export function getTranslations(languageCode: LanguageCode) {
  return translations[languageCode] || translations.en;
}

export type { TranslationKeys } from "./en";