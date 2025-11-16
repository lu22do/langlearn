import React, { useState } from "react";
import type { ISnippet, SnippetAnalysis } from "../../server/models/Snippet.js";
import { useLocalization } from "../contexts/LocalizationContext";

type Snippet = Omit<ISnippet, keyof Document> & { _id?: string };

interface SnippetCardProps {
  snippet: Snippet | (Pick<ISnippet, 'rawText' | 'languageCode' | 'sourceContext'> & SnippetAnalysis & { _id?: string });
  onDelete?: (id?: string) => void;
  saving?: boolean;
  showDetails?: boolean; // Show all analysis details (examples, explanations, etc.)
}

export default function SnippetCard({ snippet, onDelete, saving, showDetails = true }: SnippetCardProps) {
  const { t } = useLocalization();
  const [hoveredExample, setHoveredExample] = useState<number | null>(null);
  const [hoveredTranslation, setHoveredTranslation] = useState(false);

  return (
    <div
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
            {t.snippetCard.language}: <strong>{snippet.languageCode}</strong>
            {'lemma' in snippet && snippet.lemma && <span style={{ marginLeft: 12 }}>{t.snippetCard.lemma}: {snippet.lemma}</span>}
            {'partOfSpeech' in snippet && snippet.partOfSpeech && <span style={{ marginLeft: 12 }}>{t.snippetCard.pos}: {snippet.partOfSpeech}</span>}
          </div>

          {showDetails && (
            <>
              {/* AI-generated examples with hover tooltips */}
              {snippet.examples && snippet.examples.length > 0 && (
                <div style={{ marginTop: 12, marginBottom: 8 }}>
                  <strong style={{ fontSize: 13, color: "#374151" }}>{t.snippetCard.examples}:</strong>
                  <ul style={{ margin: "4px 0", paddingLeft: 20, fontSize: 13, listStyle: "none" }}>
                    {snippet.examples.map((ex, idx) => (
                      <li 
                        key={idx} 
                        style={{ 
                          marginBottom: 4,
                          cursor: "pointer",
                          padding: "6px 8px",
                          borderRadius: 4,
                          position: "relative"
                        }}
                        onMouseEnter={() => setHoveredExample(idx)}
                        onMouseLeave={() => setHoveredExample(null)}
                      >
                        <div style={{ color: "#1f2937", fontWeight: 500 }}>
                          {ex.example}
                        </div>
                        {hoveredExample === idx && (
                          <div style={{ 
                            position: "absolute",
                            bottom: "80%",
                            left: "20%",
                            transform: "translateX(-50%)",
                            marginBottom: 8,
                            padding: "8px 12px",
                            background: "#1f2937",
                            color: "#fff",
                            fontSize: 12,
                            borderRadius: 6,
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            zIndex: 10,
                            maxWidth: "400px",
                            whiteSpace: "normal"
                          }}>
                            {ex.translation}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {snippet.contextualExplanation && (
                <div style={{ marginTop: 8, marginBottom: 8 }}>
                  <strong style={{ fontSize: 13, color: "#374151" }}>{t.snippetCard.contextualExplanation}:</strong>
                  <p style={{ margin: "4px 0", fontSize: 13, color: "#4b5563" }}>
                    {snippet.contextualExplanation}
                  </p>
                </div>
              )}

              {snippet.explanations && snippet.explanations.length > 0 && (
                <div style={{ marginTop: 8, marginBottom: 8 }}>
                  <strong style={{ fontSize: 13, color: "#374151" }}>{t.snippetCard.grammarUsage}:</strong>
                  <ul style={{ margin: "4px 0", paddingLeft: 20, fontSize: 13 }}>
                    {snippet.explanations.map((ex, idx) => (
                      <li key={idx} style={{ color: "#4b5563" }}>{ex}</li>
                    ))}
                  </ul>
                </div>
              )}

              {snippet.translation && (
                <div style={{ marginTop: 8, marginBottom: 8 }}>
                  <strong style={{ fontSize: 13, color: "#374151" }}>{t.snippetCard.translation}:</strong>
                  <div 
                    style={{ 
                      margin: "4px 0", 
                      fontSize: 13,
                      cursor: "pointer",
                      padding: "6px 8px",
                      borderRadius: 4,
                      background: hoveredTranslation ? "#f0f9ff" : "transparent",
                      transition: "background 0.2s",
                      display: "inline-block"
                    }}
                    onMouseEnter={() => setHoveredTranslation(true)}
                    onMouseLeave={() => setHoveredTranslation(false)}
                  >
                    {hoveredTranslation ? (
                      <span>{snippet.translation}</span>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>{t.snippetCard.hoverToReveal}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Source context */}
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
                <strong>{t.snippetCard.context}:</strong>{" "}
                {snippet.sourceContext.length > 200
                  ? snippet.sourceContext.substring(0, 200) + "..."
                  : snippet.sourceContext}
              </div>
            </>
          )}

          {'createdAt' in snippet && snippet.createdAt && (
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
              {t.common.created}: {new Date(snippet.createdAt).toLocaleString()}
            </div>
          )}
        </div>

        {onDelete && (
          <div>
            <button
              onClick={() => onDelete(snippet._id)}
              disabled={saving}
              style={{ 
                padding: "6px 12px", 
                fontSize: 13, 
                background: "#fee", 
                border: "1px solid #fcc",
                borderRadius: 4,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1
              }}
            >
              {t.common.delete}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}