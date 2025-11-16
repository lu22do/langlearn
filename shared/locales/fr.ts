import type { TranslationKeys } from "./en";

export const fr: TranslationKeys = {
  nav: {
    home: "Accueil",
    snippets: "Extraits",
    learn: "Apprendre",
    quiz: "Quiz",
    settings: "Paramètres",
  },
  
  common: {
    loading: "Chargement...",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    refresh: "Actualiser",
    back: "Retour",
    close: "Fermer",
    confirm: "Confirmer",
    error: "Erreur",
    success: "Succès",
    saving: "Enregistrement...",
    deleting: "Suppression...",
    created: "Créé",
  },
  
  home: {
    title: "Ajouter des extraits",
    subtitle: "Collez le texte ci-dessous, sélectionnez des mots ou des phrases pour créer des extraits d'apprentissage.",
    placeholder: "Collez votre texte ici (max 20 000 caractères)...",
    characters: "caractères",
    selected: "Sélectionné",
    createSnippet: "Créer un extrait",
    analyzing: "Analyse...",
    pendingSnippet: "Extrait en attente",
    saveSnippet: "Enregistrer l'extrait",
    snippetAnalyzed: "Extrait analysé",
    snippetSaved: "Extrait enregistré dans la base de données",
    selectTextFirst: "Veuillez d'abord sélectionner du texte",
    selectedTextEmpty: "Le texte sélectionné est vide",
    failedToAnalyze: "Échec de l'analyse de l'extrait",
    failedToSave: "Échec de l'enregistrement de l'extrait",
  },
  
  snippetList: {
    title: "Extraits",
    subtitle: "Parcourez et gérez vos extraits de langue enregistrés. Cliquez sur une carte pour voir les détails.",
    savedSnippets: "Extraits enregistrés",
    noSnippets: "Aucun extrait enregistré pour le moment. Créez-en!",
    snippetDeleted: "Extrait supprimé",
    failedToLoad: "Échec du chargement des extraits",
    failedToDelete: "Échec de la suppression de l'extrait",
  },
  
  snippet: {
    title: "Détails de l'extrait",
    backToSnippets: "Retour aux extraits",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet extrait?",
    notFound: "Extrait non trouvé",
    failedToLoad: "Échec du chargement de l'extrait",
    failedToDelete: "Échec de la suppression de l'extrait",
  },
  
  snippetCard: {
    language: "Langue",
    lemma: "Lemme",
    pos: "Catégorie grammaticale",
    examples: "Exemples",
    contextualExplanation: "Explication contextuelle",
    grammarUsage: "Grammaire et utilisation",
    translation: "Traduction",
    hoverToReveal: "Survolez pour révéler",
    context: "Contexte",
  },
  
  settings: {
    title: "Paramètres",
    subtitle: "Configurez vos préférences linguistiques et paramètres d'apprentissage.",
    learningLanguage: "Langue d'apprentissage",
    learningLanguageDesc: "La langue que vous souhaitez apprendre",
    baseLanguage: "Langue de base",
    baseLanguageDesc: "Votre langue maternelle (utilisée pour les traductions)",
    uiLanguage: "Langue de l'interface",
    uiLanguageDesc: "Langue de l'interface de l'application",
    saveSettings: "Enregistrer les paramètres",
    reset: "Réinitialiser",
    currentSettings: "Paramètres actuels",
    learning: "Apprentissage",
    base: "Base",
    ui: "Interface",
    settingsSaved: "Paramètres enregistrés avec succès!",
    failedToLoad: "Échec du chargement des paramètres",
    failedToSave: "Échec de l'enregistrement des paramètres",
  },
  
  learn: {
    title: "Apprendre",
    subtitle: "Révisez vos extraits enregistrés et pratiquez.",
    comingSoon: "Bientôt disponible...",
  },
  
  quiz: {
    title: "Quiz",
    subtitle: "Testez vos connaissances avec des quiz interactifs.",
    comingSoon: "Bientôt disponible...",
  },
};