import type { TranslationKeys } from "./en";

export const it: TranslationKeys = {
  nav: {
    home: "Home",
    snippets: "Frammenti",
    learn: "Impara",
    quiz: "Quiz",
    settings: "Impostazioni",
  },
  
  common: {
    loading: "Caricamento...",
    save: "Salva",
    cancel: "Annulla",
    delete: "Elimina",
    refresh: "Aggiorna",
    back: "Indietro",
    close: "Chiudi",
    confirm: "Conferma",
    error: "Errore",
    success: "Successo",
    saving: "Salvataggio...",
    deleting: "Eliminazione...",
    created: "Creato",
  },
  
  home: {
    title: "Aggiungi frammenti",
    subtitle: "Incolla il testo qui sotto, seleziona parole o frasi per creare frammenti per l'apprendimento.",
    placeholder: "Incolla il tuo testo qui (max 20.000 caratteri)...",
    characters: "caratteri",
    selected: "Selezionato",
    createSnippet: "Crea frammento",
    analyzing: "Analisi...",
    pendingSnippet: "Frammento in sospeso",
    saveSnippet: "Salva frammento",
    snippetAnalyzed: "Frammento analizzato",
    snippetSaved: "Frammento salvato nel database",
    selectTextFirst: "Seleziona prima il testo",
    selectedTextEmpty: "Il testo selezionato è vuoto",
    failedToAnalyze: "Impossibile analizzare il frammento",
    failedToSave: "Impossibile salvare il frammento",
  },
  
  snippetList: {
    title: "Frammenti",
    subtitle: "Sfoglia e gestisci i tuoi frammenti di lingua salvati. Clicca su una scheda per vedere i dettagli.",
    savedSnippets: "Frammenti salvati",
    noSnippets: "Nessun frammento salvato ancora. Creane alcuni!",
    snippetDeleted: "Frammento eliminato",
    failedToLoad: "Impossibile caricare i frammenti",
    failedToDelete: "Impossibile eliminare il frammento",
  },
  
  snippet: {
    title: "Dettagli del frammento",
    backToSnippets: "Torna ai frammenti",
    confirmDelete: "Sei sicuro di voler eliminare questo frammento?",
    notFound: "Frammento non trovato",
    failedToLoad: "Impossibile caricare il frammento",
    failedToDelete: "Impossibile eliminare il frammento",
  },
  
  snippetCard: {
    language: "Lingua",
    lemma: "Lemma",
    pos: "Parte del discorso",
    examples: "Esempi",
    contextualExplanation: "Spiegazione contestuale",
    grammarUsage: "Grammatica e uso",
    translation: "Traduzione",
    hoverToReveal: "Passa sopra per rivelare",
    context: "Contesto",
  },
  
  settings: {
    title: "Impostazioni",
    subtitle: "Configura le tue preferenze linguistiche e impostazioni di apprendimento.",
    learningLanguage: "Lingua di apprendimento",
    learningLanguageDesc: "La lingua che vuoi imparare",
    baseLanguage: "Lingua base",
    baseLanguageDesc: "La tua lingua madre (usata per le traduzioni)",
    uiLanguage: "Lingua dell'interfaccia",
    uiLanguageDesc: "Lingua per l'interfaccia dell'app",
    saveSettings: "Salva impostazioni",
    reset: "Ripristina",
    currentSettings: "Impostazioni attuali",
    learning: "Apprendimento",
    base: "Base",
    ui: "Interfaccia",
    settingsSaved: "Impostazioni salvate con successo!",
    failedToLoad: "Impossibile caricare le impostazioni",
    failedToSave: "Impossibile salvare le impostazioni",
  },
  
  learn: {
    title: "Impara",
    subtitle: "Rivedi i tuoi frammenti salvati e pratica.",
    comingSoon: "Prossimamente...",
  },
  
  quiz: {
    title: "Quiz",
    subtitle: "Testa le tue conoscenze con quiz interattivi.",
    comingSoon: "Prossimamente...",
  },
};