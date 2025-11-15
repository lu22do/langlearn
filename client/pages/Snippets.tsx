import React, { useState, useEffect, useRef } from "react";
import type { ISnippet } from "../../server/models/Snippet.js";

type Snippet = Omit<ISnippet, keyof Document> & { _id?: string }; 

interface PendingSnippet {
  rawText: string;
  languageCode: string;
  sourceContext: string;
  tags: string[];
  startOffset: number;
  endOffset: number;
}

export default function Snippets() {
  const [savedSnippets, setSavedSnippets] = useState<Snippet[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch saved snippets on mount
  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/snippets");
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setSavedSnippets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load snippets");
    } finally {
      setLoading(false);
    }
  };

  const deleteSnippet = async (id?: string) => {
    if (!id) return;
    
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/snippets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setSuccess("Snippet deleted");
      setTimeout(() => setSuccess(null), 3000);
      await fetchSnippets();
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete snippet");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      {/* Saved Snippets List */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Saved Snippets ({savedSnippets.length})</h2>
          <button onClick={fetchSnippets} disabled={loading} style={{ padding: "8px 16px" }}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p>Loading snippets...</p>
        ) : savedSnippets.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No snippets saved yet. Create some!</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {savedSnippets.map((snippet) => (
              <div
                key={snippet._id}
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
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                      Language: <strong>{snippet.languageCode}</strong>
                      {snippet.lemma && <span style={{ marginLeft: 12 }}>Lemma: {snippet.lemma}</span>}
                      {snippet.partOfSpeech && <span style={{ marginLeft: 12 }}>POS: {snippet.partOfSpeech}</span>}
                    </div>
                    {snippet.tags && snippet.tags.length > 0 && (
                      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                        Tags: {snippet.tags.join(", ")}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        fontStyle: "italic",
                        marginTop: 8,
                        padding: 8,
                        background: "#f9fafb",
                        borderRadius: 4,
                      }}
                    >
                      {snippet.sourceContext.length > 200
                        ? snippet.sourceContext.substring(0, 200) + "..."
                        : snippet.sourceContext}
                    </div>
                    {snippet.createdAt && (
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
                        Created: {new Date(snippet.createdAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => deleteSnippet(snippet._id)}
                      disabled={saving}
                      style={{ padding: "6px 12px", fontSize: 13, background: "#fee", border: "1px solid #fcc" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}