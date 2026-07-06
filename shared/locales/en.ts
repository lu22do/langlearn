export const en = {
  // Navigation
  nav: {
    home: "Home",
    snippets: "Snippets",
    learn: "Review",
    quiz: "Quiz",
    settings: "Settings",
  },
  
  // Common
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    refresh: "Refresh",
    back: "Back",
    close: "Close",
    confirm: "Confirm",
    error: "Error",
    success: "Success",
    saving: "Saving...",
    deleting: "Deleting...",
    created: "Created",
  },
  
  // Home page
  home: {
    title: "Add Snippets",
    subtitle: "Paste text below, select words or phrases to create snippets for learning.",
    placeholder: "Paste your text here (max 20,000 characters)...",
    characters: "characters",
    selected: "Selected",
    createSnippet: "Create Snippet",
    analyzing: "Analyzing...",
    pendingSnippet: "Pending Snippet",
    saveSnippet: "Save Snippet",
    snippetAnalyzed: "Analyzed snippet",
    snippetSaved: "Saved snippet to database",
    selectTextFirst: "Please select text first",
    selectedTextEmpty: "Selected text is empty",
    failedToAnalyze: "Failed to analyze snippet",
    failedToSave: "Failed to save snippet",
  },
  
  // Snippet List page
  snippetList: {
    title: "Snippets",
    subtitle: "Browse and manage your saved language snippets. Click on a card to view details.",
    savedSnippets: "Saved Snippets",
    noSnippets: "No snippets saved yet. Create some!",
    snippetDeleted: "Snippet deleted",
    failedToLoad: "Failed to load snippets",
    failedToDelete: "Failed to delete snippet",
  },
  
  // Snippet detail page
  snippet: {
    title: "Snippet Details",
    backToSnippets: "Back to Snippets",
    confirmDelete: "Are you sure you want to delete this snippet?",
    notFound: "Snippet not found",
    failedToLoad: "Failed to load snippet",
    failedToDelete: "Failed to delete snippet",
  },
  
  // Snippet Card
  snippetCard: {
    language: "Language",
    lemma: "Lemma",
    pos: "POS",
    examples: "Examples",
    contextualExplanation: "Contextual Explanation",
    grammarUsage: "Grammar & Usage",
    translation: "Translation",
    hoverToReveal: "Hover to reveal",
    context: "Context",
  },
  
  // Settings page
  settings: {
    title: "Settings",
    subtitle: "Configure your language preferences and learning settings.",
    learningLanguage: "Learning Language",
    learningLanguageDesc: "The language you want to learn",
    baseLanguage: "Base Language",
    baseLanguageDesc: "Your native language (used for translations)",
    uiLanguage: "UI Language",
    uiLanguageDesc: "Language for the app interface",
    saveSettings: "Save Settings",
    reset: "Reset",
    currentSettings: "Current Settings",
    learning: "Learning",
    base: "Base",
    ui: "UI",
    settingsSaved: "Settings saved successfully!",
    failedToLoad: "Failed to load settings",
    failedToSave: "Failed to save settings",
  },
  
  // Learn page
  learn: {
    title: "Review",
    subtitle: "Review your saved snippets and practice.",
    comingSoon: "Coming soon...",
  },
  
  // Quiz page
  quiz: {
    title: "Quiz",
    subtitle: "Test your knowledge with interactive quizzes.",
    comingSoon: "Coming soon...",
  },
};

export type TranslationKeys = typeof en;