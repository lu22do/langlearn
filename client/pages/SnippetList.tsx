import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { ISnippet, SnippetState } from "../../server/models/Snippet.js";
import { useLocalization } from "../contexts/LocalizationContext";
import { apiFetch } from "../lib/api";
import { StateBadge } from "../components/StateSelector";

type Snippet = Omit<ISnippet, keyof Document> & { _id?: string };

const ALL_STATES: SnippetState[] = ["new", "still learning", "known"];

export default function SnippetList() {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [savedSnippets, setSavedSnippets] = useState<Snippet[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedStates, setSelectedStates] = useState<SnippetState[]>(["new", "still learning"]);

  const stateLabels: Record<SnippetState, string> = {
    new: t.state.new,
    "still learning": t.state.stillLearning,
    known: t.state.knownArchived,
  };

  const toggleState = (state: SnippetState) => {
    setSelectedStates((current) =>
      current.includes(state) ? current.filter((s) => s !== state) : [...current, state]
    );
  };

  // Close the filter dropdown when clicking outside of it
  const filterRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const el = filterRef.current;
      if (el && el.open && !el.contains(event.target as Node)) {
        el.open = false;
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Fetch saved snippets on mount and when the filter changes
  useEffect(() => {
    fetchSnippets();
  }, [selectedStates]);

  const fetchSnippets = async () => {
    if (selectedStates.length === 0) {
      setSavedSnippets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/snippets?state=${encodeURIComponent(selectedStates.join(","))}`);
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
      const res = await apiFetch(`/api/snippets/${id}`, { method: "DELETE" });
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ margin: 0 }}>{t.snippetList.savedSnippets} ({savedSnippets.length})</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, color: "#6b7280" }}>{t.state.filterByState}:</span>
            <details ref={filterRef} className="dropdown" style={{ margin: 0, minWidth: 220 }}>
              <summary style={{ fontSize: 14 }}>
                {selectedStates.length === 0
                  ? "—"
                  : selectedStates.length === ALL_STATES.length
                  ? t.state.all
                  : ALL_STATES.filter((s) => selectedStates.includes(s)).map((s) => stateLabels[s]).join(", ")}
              </summary>
              <ul>
                {ALL_STATES.map((state) => (
                  <li key={state}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, margin: 0, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={selectedStates.includes(state)}
                        onChange={() => toggleState(state)}
                        style={{ margin: 0 }}
                      />
                      {stateLabels[state]}
                    </label>
                  </li>
                ))}
              </ul>
            </details>
            <button onClick={fetchSnippets} disabled={loading} style={{ padding: "8px 16px", margin: 0 }}>
              {loading ? t.common.loading : t.common.refresh}
            </button>
          </div>
        </div>

        {loading ? (
          <p>{t.common.loading}</p>
        ) : savedSnippets.length === 0 ? (
          <p style={{ color: "#6b7280" }}>{t.snippetList.noSnippets}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                  <th style={{ padding: "12px 10px", fontSize: 13, color: "#6b7280" }}>{t.snippetList.snippet}</th>
                  <th style={{ padding: "12px 10px", fontSize: 13, color: "#6b7280" }}>{t.state.state}</th>
                  <th style={{ padding: "12px 10px", fontSize: 13, color: "#6b7280" }}>{t.snippetCard.contextOrExample}</th>
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
                      <td style={{ padding: "12px 10px" }}>
                        <StateBadge state={snippet.state || "new"} compact />
                      </td>
                      <td style={{ padding: "12px 10px", fontSize: 15, color: "#4b5563", maxWidth: "40vw" }}>
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