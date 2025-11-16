import React, { useState, useRef } from "react";
import type { SnippetAnalysis, ISnippet } from "../../server/models/Snippet.js";
import { useSettings } from "../contexts/SettingsContext";
import SnippetCard from "../components/SnippetCard";

type Snippet = Pick<ISnippet, 'rawText' | 'languageCode' | 'sourceContext'> & { _id?: string }; 

interface PendingSnippetWithAnalysis extends Snippet, SnippetAnalysis {}

export default function Home() {
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
      setError("Please select text first");
      return;
    }

    const rawText = prompt.substring(selection.start, selection.end).trim();
    
    if (!rawText) {
      setError("Selected text is empty");
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      // Call the analyze API
      const res = await fetch("/api/snippets/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: rawText,
          context: prompt,
          learning_language: settings.learningLanguageCode,
          base_language: settings.baseLanguageCode,
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
      setSuccess(`Analyzed snippet: "${rawText}"`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message ?? "Failed to analyze snippet");
    } finally {
      setAnalyzing(false);
    }
  };

  const saveSnippet = async (snippet: PendingSnippetWithAnalysis) => {
    setSaving(true);
    setError(null);
console.log("Saving snippet:", snippet);
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
      setSuccess(`Saved snippet: "${saved.rawText}" to database`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Remove from local list after saving
      setPendingSnippet(null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to save snippet");
    } finally {
      setSaving(false);
    }
  };

  const selectedText = selection ? prompt.substring(selection.start, selection.end) : "";

  return (
    <section>
      <h1>Add Snippets</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Paste text below, select words or phrases to create snippets for learning.
      </p>

      <div style={{ marginBottom: 24 }}>
        <textarea
          ref={textAreaRef}
          value={prompt}
          onChange={handleTextChange}
          onMouseUp={handleTextSelect}
          onKeyUp={handleTextSelect}
          placeholder="Paste your text here (max 20,000 characters)..."
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
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
          </span>
        </div>
      </div>

      {selection && selectedText && (
        <div style={{ marginBottom: 24, padding: 12, background: "#f0f9ff", borderRadius: 6, border: "1px solid #bfdbfe" }}>
          <strong>Selected:</strong> "{selectedText}"
          <button
            onClick={createSnippet}
            disabled={analyzing}
            style={{ marginLeft: 12, padding: "6px 12px", fontSize: 13 }}
          >
            {analyzing ? "Analyzing..." : "Create Snippet"}
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
            <h2 style={{ margin: 0 }}>Pending Snippet</h2>
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
              <SnippetCard snippet={pendingSnippet} saving={saving} showTooltips={true} />
              
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
                  {saving ? "Saving..." : "Save Snippet"}
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
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}