import React, { useState } from "react";
import type { ISnippet, SnippetAnalysis } from "../../server/models/Snippet.js";

type Snippet = Omit<ISnippet, keyof Document> & { _id?: string };

interface SnippetCardProps {
  snippet: Snippet | (Pick<ISnippet, 'rawText' | 'languageCode' | 'sourceContext'> & SnippetAnalysis & { _id?: string });
  onDelete?: (id?: string) => void;
  saving?: boolean;
  showDetails?: boolean;
  showTooltips?: boolean; // Show hover tooltips for examples and translation
}

export default function SnippetCard({ snippet, onDelete, saving, showDetails = false, showTooltips = false }: SnippetCardProps) {
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
            Language: <strong>{snippet.languageCode}</strong>
            {'lemma' in snippet && snippet.lemma && <span style={{ marginLeft: 12 }}>Lemma: {snippet.lemma}</span>}
            {'partOfSpeech' in snippet && snippet.partOfSpeech && <span style={{ marginLeft: 12 }}>POS: {snippet.partOfSpeech}</span>}
          </div>

          {/* AI-generated analysis */}
          {showDetails && snippet.examples && snippet.examples.length > 0 && (
            <div style={{ marginTop: 12, marginBottom: 8 }}>
              <strong style={{ fontSize: 13, color: "#374151" }}>Examples:</strong>
              <ul style={{ margin: "4px 0", paddingLeft: 20, fontSize: 13, listStyle: showTooltips ? "none" : "disc" }}>
                {snippet.examples.map((ex, idx) => (
                  <li 
                    key={idx} 
                    style={{ 
                      marginBottom: 4,
                      cursor: showTooltips ? "pointer" : "default",
                      padding: showTooltips ? "6px 8px" : 0,
                      borderRadius: 4,
                      position: "relative"
                    }}
                    onMouseEnter={() => showTooltips && setHoveredExample(idx)}
                    onMouseLeave={() => showTooltips && setHoveredExample(null)}
                  >
                    <div style={{ color: "#1f2937", fontWeight: showTooltips ? 500 : 400 }}>
                      {ex.example}
                    </div>
                    {showTooltips && hoveredExample === idx && (
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
                    {!showTooltips && (
                      <div style={{ color: "#6b7280", fontSize: 12, fontStyle: "italic", marginTop: 2 }}>
                        {ex.translation}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showDetails && snippet.contextualExplanation && (
            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <strong style={{ fontSize: 13, color: "#374151" }}>Contextual Explanation:</strong>
              <p style={{ margin: "4px 0", fontSize: 13, color: "#4b5563" }}>
                {snippet.contextualExplanation}
              </p>
            </div>
          )}

          {showDetails && snippet.explanations && snippet.explanations.length > 0 && (
            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <strong style={{ fontSize: 13, color: "#374151" }}>Grammar & Usage:</strong>
              <ul style={{ margin: "4px 0", paddingLeft: 20, fontSize: 13 }}>
                {snippet.explanations.map((ex, idx) => (
                  <li key={idx} style={{ color: "#4b5563" }}>{ex}</li>
                ))}
              </ul>
            </div>
          )}

          {showDetails && snippet.translation && (
            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <strong style={{ fontSize: 13, color: "#374151" }}>Translation:</strong>
              {showTooltips ? (
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
                    <span style={{ color: "#9ca3af" }}>Hover to reveal</span>
                  )}
                </div>
              ) : (
                <span style={{ marginLeft: 8, fontSize: 13, color: "#4b5563" }}>{snippet.translation}</span>
              )}
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
            <strong>Context:</strong>{" "}
            {snippet.sourceContext.length > 200
              ? snippet.sourceContext.substring(0, 200) + "..."
              : snippet.sourceContext}
          </div>

          {'createdAt' in snippet && snippet.createdAt && (
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
              Created: {new Date(snippet.createdAt).toLocaleString()}
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
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}