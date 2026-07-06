import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ISnippet } from "../../server/models/Snippet.js";
import { useLocalization } from "../contexts/LocalizationContext";

type Snippet = Omit<ISnippet, keyof Document> & { _id?: string }; 

export default function SnippetList() {
  const { t } = useLocalization();
  const navigate = useNavigate();
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
      setError(err?.message ?? t.snippetList.failedToLoad);
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
      setSuccess(t.snippetList.snippetDeleted);
      setTimeout(() => setSuccess(null), 3000);
      await fetchSnippets();
    } catch (err: any) {
      setError(err?.message ?? t.snippetList.failedToDelete);
    } finally {
      setSaving(false);
    }
  };

  const handleCardClick = (id?: string) => {
    if (id) {
      navigate(`/snippets/${id}`);
    }
  };

  const getPreviewText = (snippet: Snippet) => {
    const context = snippet.sourceContext?.trim();
    if (context) return context;

    const firstExample = snippet.examples?.find((example) => example?.example?.trim());
    return firstExample?.example?.trim() || "";
  };

  return (
    <section>
      <h1>{t.snippetList.title}</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        {t.snippetList.subtitle}
      </p>

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

      {/* Saved Snippets List */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>{t.snippetList.savedSnippets} ({savedSnippets.length})</h2>
          <button onClick={fetchSnippets} disabled={loading} style={{ padding: "8px 16px" }}>
            {loading ? t.common.loading : t.common.refresh}
          </button>
        </div>

        {loading ? (
          <p>{t.common.loading}</p>
        ) : savedSnippets.length === 0 ? (
          <p style={{ color: "#6b7280" }}>{t.snippetList.noSnippets}</p>
        ) : (
          <div style={{ overflowX: "auto", display: "flex", justifyContent: "center" }}>
            <table style={{ width: "100%", minWidth: 1200, borderCollapse: "collapse", background: "#fff" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                  <th style={{ padding: "12px 10px", fontSize: 13, color: "#6b7280" }}>{t.snippetList.title}</th>
                  <th style={{ padding: "12px 10px", fontSize: 13, color: "#6b7280", width: "90%" }}>{t.snippetCard.examples}</th>
                  <th style={{ padding: "12px 10px", width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {savedSnippets.map((snippet) => {
                  const previewText = getPreviewText(snippet);
                  return (
                    <tr
                      key={snippet._id}
                      onClick={() => handleCardClick(snippet._id)}
                      style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer", transition: "background 0.2s" }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = "#f9fafb";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td style={{ padding: "12px 10px", fontSize: 16, fontWeight: 600, color: "#111827" }}>
                        {snippet.rawText}
                      </td>
                      <td style={{ padding: "12px 10px", fontSize: 15, color: "#4b5563", maxWidth: 480 }}>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {previewText}
                        </div>
                      </td>
                      <td style={{ padding: "12px 10px" }} onClick={(event) => event.stopPropagation()}>
                        <button
                          onClick={() => deleteSnippet(snippet._id)}
                          disabled={saving}
                          style={{ padding: "6px 10px", fontSize: 12 }}
                        >
                          {t.common.delete}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}