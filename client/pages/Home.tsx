import React, { useState, useRef } from "react";
import type { SnippetAnalysis, ISnippet } from "../../server/models/Snippet.js";
import { useSettings } from "../contexts/SettingsContext";
import { useLocalization } from "../contexts/LocalizationContext";
import SnippetCard from "../components/SnippetCard";

type Snippet = Pick<ISnippet, 'rawText' | 'languageCode' | 'sourceContext'> & { _id?: string }; 

interface PendingSnippetWithAnalysis extends Snippet, SnippetAnalysis {}

export default function Home() {
  const { t } = useLocalization();
  const [prompt, setPrompt] = useState("");
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [pendingSnippet, setPendingSnippet] = useState<PendingSnippetWithAnalysis | null>(null);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { settings } = useSettings();

  const MAX_CHARS = 20000;
  const charCount = prompt.length;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setPrompt(text);
      setError(null);
    }
  };

  const handleTextSelect = () => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      setSelection({ start, end });
      setError(null);
    }
  };

  const createSnippet = async () => {
    if (!selection || !prompt) {
      setError(t.home.selectTextFirst);
      return;
    }

    const rawText = prompt.substring(selection.start, selection.end).trim();
    
    if (!rawText) {
      setError(t.home.selectedTextEmpty);
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/snippets/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: rawText,
          context: prompt,
          learning_language: settings.learningLanguageCode,
          base_language: settings.baseLanguageCode,
          ui_language: settings.UILanguageCode,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error ?? `Server returned ${res.status}`);
      }

      const data = await res.json();
      
      const newSnippet: PendingSnippetWithAnalysis = {
        rawText,
        languageCode: settings.learningLanguageCode,
        sourceContext: prompt,
        ...data.analysis
      };

      console.log("Analyzed snippet:", newSnippet);
      setPendingSnippet(newSnippet);
      setSelection(null);
      setSuccess(`${t.home.snippetAnalyzed}: "${rawText}"`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message ?? t.home.failedToAnalyze);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveSnippet = async (snippet: PendingSnippetWithAnalysis) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snippet),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message ?? `Server returned ${res.status}`);
      }

      const saved = await res.json();
      setSuccess(`${t.home.snippetSaved}: "${saved.rawText}"`);
      setTimeout(() => setSuccess(null), 3000);
      
      setPendingSnippet(null);
    } catch (err: any) {
      setError(err?.message ?? t.home.failedToSave);
    } finally {
      setSaving(false);
    }
  };

  const selectedText = selection ? prompt.substring(selection.start, selection.end) : "";

  return (
    <section>
      <h1>{t.home.title}</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        {t.home.subtitle}
      </p>

      <div style={{ marginBottom: 24 }}>
        <textarea
          ref={textAreaRef}
          value={prompt}
          onChange={handleTextChange}
          onMouseUp={handleTextSelect}
          onKeyUp={handleTextSelect}
          placeholder={t.home.placeholder}
          style={{
            width: "100%",
            minHeight: 200,
            padding: 12,
            fontSize: 14,
            fontFamily: "monospace",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            resize: "vertical",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 13, color: charCount > MAX_CHARS * 0.9 ? "#dc2626" : "#6b7280" }}>
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} {t.home.characters}
          </span>
        </div>
      </div>

      {selection && selectedText && (
        <div style={{ marginBottom: 24, padding: 12, background: "#f0f9ff", borderRadius: 6, border: "1px solid #bfdbfe" }}>
          <strong>{t.home.selected}:</strong> "{selectedText}"
          <button
            onClick={createSnippet}
            disabled={analyzing}
            style={{ marginLeft: 12, padding: "6px 12px", fontSize: 13 }}
          >
            {analyzing ? t.home.analyzing : t.home.createSnippet}
          </button>
        </div>
      )}

      {error && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fee", border: "1px solid #fcc", borderRadius: 6, color: "#c00" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: 12, marginBottom: 16, background: "#efe", border: "1px solid #cfc", borderRadius: 6, color: "#060" }}>
          {success}
        </div>
      )}

      {pendingSnippet && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>{t.home.pendingSnippet}</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                padding: 16,
                border: "2px solid #3b82f6",
                borderRadius: 8,
                background: "#eff6ff",
              }}
            >
              <SnippetCard snippet={pendingSnippet} saving={saving} showDetails={true} />
              
              <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 16, borderTop: "1px solid #bfdbfe" }}>
                <button
                  onClick={() => saveSnippet(pendingSnippet)}
                  disabled={saving}
                  style={{ 
                    padding: "8px 16px", 
                    fontSize: 14,
                    fontWeight: 600,
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1
                  }}
                >
                  {saving ? t.common.saving : t.home.saveSnippet}
                </button>
                <button
                  onClick={() => setPendingSnippet(null)}
                  style={{ 
                    padding: "8px 16px", 
                    fontSize: 14,
                    fontWeight: 600,
                    background: "#f3f4f6", 
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                >
                  {t.common.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}