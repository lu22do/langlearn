import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ISnippet } from "../../server/models/Snippet.js";
import { useLocalization } from "../contexts/LocalizationContext";
import SnippetCard from "../components/SnippetCard";

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
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {savedSnippets.map((snippet) => (
              <div 
                key={snippet._id}
                onClick={() => handleCardClick(snippet._id)}
                style={{ cursor: "pointer" }}
              >
                <SnippetCard
                  snippet={snippet}
                  saving={saving}
                  showDetails={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}