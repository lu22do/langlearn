import type { TranslationKeys } from "./en";

export const ja: TranslationKeys = {
  nav: {
    home: "ホーム",
    snippets: "スニペット",
    learn: "復習",
    quiz: "クイズ",
    settings: "設定",
  },
  
  common: {
    loading: "読み込み中...",
    save: "保存",
    cancel: "キャンセル",
    delete: "削除",
    refresh: "更新",
    back: "戻る",
    close: "閉じる",
    confirm: "確認",
    error: "エラー",
    success: "成功",
    saving: "保存中...",
    deleting: "削除中...",
    created: "作成日時",
  },
  
  home: {
    title: "スニペットを追加",
    subtitle: "下にテキストを貼り付け、学習用のスニペットを作成する単語やフレーズを選択してください。",
    placeholder: "ここにテキストを貼り付けてください（最大20,000文字）...",
    characters: "文字",
    selected: "選択済み",
    createSnippet: "スニペットを作成",
    analyzing: "分析中...",
    pendingSnippet: "保留中のスニペット",
    saveSnippet: "スニペットを保存",
    snippetAnalyzed: "スニペットを分析しました",
    snippetSaved: "スニペットをデータベースに保存しました",
    selectTextFirst: "最初にテキストを選択してください",
    selectedTextEmpty: "選択されたテキストが空です",
    failedToAnalyze: "スニペットの分析に失敗しました",
    failedToSave: "スニペットの保存に失敗しました",
  },
  
  snippetList: {
    title: "スニペット",
    subtitle: "保存された言語スニペットを閲覧・管理します。カードをクリックして詳細を表示します。",
    savedSnippets: "保存されたスニペット",
    noSnippets: "まだスニペットが保存されていません。作成してください！",
    snippetDeleted: "スニペットを削除しました",
    failedToLoad: "スニペットの読み込みに失敗しました",
    failedToDelete: "スニペットの削除に失敗しました",
  },
  
  snippet: {
    title: "スニペットの詳細",
    backToSnippets: "スニペット一覧に戻る",
    confirmDelete: "このスニペットを削除してもよろしいですか？",
    notFound: "スニペットが見つかりません",
    failedToLoad: "スニペットの読み込みに失敗しました",
    failedToDelete: "スニペットの削除に失敗しました",
  },
  
  snippetCard: {
    language: "言語",
    lemma: "見出し語",
    pos: "品詞",
    examples: "例文",
    contextualExplanation: "文脈的な説明",
    grammarUsage: "文法と使い方",
    translation: "翻訳",
    hoverToReveal: "マウスオーバーで表示",
    context: "文脈",
  },
  
  settings: {
    title: "設定",
    subtitle: "言語の設定と学習設定を構成します。",
    learningLanguage: "学習言語",
    learningLanguageDesc: "学習したい言語",
    baseLanguage: "基本言語",
    baseLanguageDesc: "母国語（翻訳に使用）",
    uiLanguage: "UI言語",
    uiLanguageDesc: "アプリのインターフェース言語",
    saveSettings: "設定を保存",
    reset: "リセット",
    currentSettings: "現在の設定",
    learning: "学習",
    base: "基本",
    ui: "UI",
    settingsSaved: "設定を正常に保存しました！",
    failedToLoad: "設定の読み込みに失敗しました",
    failedToSave: "設定の保存に失敗しました",
  },
  
  learn: {
    title: "復習",
    subtitle: "保存されたスニペットを復習して練習します。",
    comingSoon: "近日公開...",
  },
  
  quiz: {
    title: "クイズ",
    subtitle: "インタラクティブなクイズで知識をテストします。",
    comingSoon: "近日公開...",
  },
};