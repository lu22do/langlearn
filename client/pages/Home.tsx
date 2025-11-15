import React, { useState, useRef } from "react";
import type { ISnippet } from "../../server/models/Snippet.js";

type Snippet = Pick<ISnippet, 'rawText' | 'languageCode' | 'sourceContext'> & { _id?: string }; 

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [saving, setSaving] = useState(false);
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

  const createSnippet = () => {
    if (!selection || !prompt) {
      setError("Please select text first");
      return;
    }

    const rawText = prompt.substring(selection.start, selection.end).trim();
    
    if (!rawText) {
      setError("Selected text is empty");
      return;
    }

    const newSnippet: Snippet = {
      rawText,
      languageCode: "de",
      sourceContext: prompt,
    };

    setSnippets([...snippets, newSnippet]);
    setSelection(null);
    setSuccess(`Added snippet: "${rawText}"`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const saveSnippet = async (snippet: Snippet) => {
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
      setSnippets(snippets.filter(s => s !== snippet));
    } catch (err: any) {
      setError(err?.message ?? "Failed to save snippet");
    } finally {
      setSaving(false);
    }
  };

  const saveAllSnippets = async () => {
    setSaving(true);
    setError(null);

    try {
      for (const snippet of snippets) {
        await fetch("/api/snippets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(snippet),
        });
      }
      setSuccess(`Saved ${snippets.length} snippet(s) to database`);
      setSnippets([]);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message ?? "Failed to save snippets");
    } finally {
      setSaving(false);
    }
  };

  const removeSnippet = (index: number) => {
    setSnippets(snippets.filter((_, i) => i !== index));
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
            style={{ marginLeft: 12, padding: "6px 12px", fontSize: 13 }}
          >
            Create Snippet
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

      {snippets.length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Pending Snippets ({snippets.length})</h2>
            <button onClick={saveAllSnippets} disabled={saving} style={{ padding: "8px 16px" }}>
              {saving ? "Saving..." : "Save All to Database"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {snippets.map((snippet, idx) => (
              <div
                key={idx}
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
                      {snippet.rawText}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        fontStyle: "italic",
                        maxWidth: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => saveSnippet(snippet)}
                      disabled={saving}
                      style={{ padding: "6px 12px", fontSize: 13 }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => removeSnippet(idx)}
                      style={{ padding: "6px 12px", fontSize: 13, background: "#fee", border: "1px solid #fcc" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}