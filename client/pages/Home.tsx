import React, { useState, useRef } from "react";
import type { SnippetAnalysis, ISnippet } from "../../server/models/Snippet.js";

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
          learning_language: "de",
          base_language: "en"
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error ?? `Server returned ${res.status}`);
      }

      const data = await res.json();
      
      const newSnippet: PendingSnippetWithAnalysis = {
        rawText,
        languageCode: "de",
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
              key={pendingSnippet._id || "pending"}
              style={{
                padding: 16,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                    {pendingSnippet.rawText}
                  </div>
                  
                  {/* Display AI analysis */}
                  <div style={{ marginTop: 12, padding: 12, background: "#f9fafb", borderRadius: 6 }}>
                    {pendingSnippet.examples && pendingSnippet.examples.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <strong style={{ fontSize: 13, color: "#374151" }}>Examples:</strong>
                        <ul style={{ margin: "4px 0", paddingLeft: 20, fontSize: 13, listStyle: "none" }}>
                          {pendingSnippet.examples.map((ex, idx) => (
                            <li key={idx} style={{ marginBottom: 8 }}>
                              <div style={{ color: "#1f2937", fontWeight: 500 }}>{ex.example}</div>
                              <div style={{ color: "#6b7280", fontSize: 12, fontStyle: "italic" }}>{ex.translation}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {pendingSnippet.contextualExplanation && (
                      <div style={{ marginBottom: 12 }}>
                        <strong style={{ fontSize: 13, color: "#374151" }}>Contextual Explanation:</strong>
                        <p style={{ margin: "4px 0", fontSize: 13 }}>{pendingSnippet.contextualExplanation}</p>
                      </div>
                    )}
                    
                    {pendingSnippet.explanations && pendingSnippet.explanations.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <strong style={{ fontSize: 13, color: "#374151" }}>Grammar & Usage:</strong>
                        <ul style={{ margin: "4px 0", paddingLeft: 20, fontSize: 13 }}>
                          {pendingSnippet.explanations.map((ex, idx) => (
                            <li key={idx}>{ex}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {pendingSnippet.translation && (
                      <div>
                        <strong style={{ fontSize: 13, color: "#374151" }}>Translation:</strong>
                        <p style={{ margin: "4px 0", fontSize: 13 }}>{pendingSnippet.translation}</p>
                      </div>
                    )}
                  </div>
                  
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                      fontStyle: "italic",
                      marginTop: 8,
                      maxWidth: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Context: {pendingSnippet.sourceContext.substring(0, 100)}...
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => saveSnippet(pendingSnippet)}
                    disabled={saving}
                    style={{ padding: "6px 12px", fontSize: 13 }}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setPendingSnippet(null)}
                    style={{ padding: "6px 12px", fontSize: 13, background: "#f3f4f6", border: "1px solid #d1d5db" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}