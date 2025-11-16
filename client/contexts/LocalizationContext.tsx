import React, { createContext, useContext, ReactNode } from "react";
import { useSettings } from "./SettingsContext";
import { getTranslations, type TranslationKeys } from "../../shared/locales/index";

interface LocalizationContextType {
  t: TranslationKeys;
  locale: string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used within a LocalizationProvider");
  }
  return context;
};

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings, loading } = useSettings();
  
  // Default to English while loading
  const locale = loading ? "en" : settings.UILanguageCode;
  const t = getTranslations(locale as any);

  return (
    <LocalizationContext.Provider value={{ t, locale }}>
      {children}
    </LocalizationContext.Provider>
  );
};