import React, { useState, useEffect } from "react";
import type { ISnippet } from "../../server/models/Snippet.js";
import SnippetCard from "../components/SnippetCard";

type Snippet = Omit<ISnippet, keyof Document> & { _id?: string }; 

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
      <h1>Snippets</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Browse and manage your saved language snippets.
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
              <SnippetCard
                key={snippet._id}
                snippet={snippet}
                onDelete={deleteSnippet}
                saving={saving}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}