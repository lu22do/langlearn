import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ISnippet, SnippetAnalysis } from "../../server/models/Snippet.js";
import Example from "./Example";
import { useLocalization } from "../contexts/LocalizationContext";

type Snippet = Omit<ISnippet, keyof Document> & { _id?: string };

interface SnippetCardProps {
  snippet: Snippet | (Pick<ISnippet, 'rawText' | 'languageCode' | 'sourceContext'> & SnippetAnalysis & { _id?: string });
  onDelete?: (id?: string) => void;
  saving?: boolean;
}

export default function SnippetCard({ snippet, onDelete, saving }: SnippetCardProps) {
  const { t } = useLocalization();
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
          
          <>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                {t.snippetCard.language}: <strong>{snippet.languageCode}</strong>
                {'lemma' in snippet && snippet.lemma && <span style={{ marginLeft: 12 }}>{t.snippetCard.lemma}: {snippet.lemma}</span>}
                {'partOfSpeech' in snippet && snippet.partOfSpeech && <span style={{ marginLeft: 12 }}>{t.snippetCard.pos}: {snippet.partOfSpeech}</span>}
              </div>

              {snippet.sourceContext && (
                <div className="snippet-container">
                  <strong className="snippet-header">{t.snippetCard.context}:</strong>{" "}
                  <p style={{ margin: "4px 0", fontSize: 13, color: "#4b5563" }}>
                  {snippet.sourceContext.length > 200
                    ? snippet.sourceContext.substring(0, 200) + "..."
                    : snippet.sourceContext}
                  </p>
                </div>
              )}

                  {/* AI-generated examples with hover translations */}
              {snippet.examples && snippet.examples.length > 0 && (
                <div className="snippet-container">
                  <strong className="snippet-header">{t.snippetCard.examples}:</strong>
                  <ul style={{ margin: "4px 0", paddingLeft: 20, fontSize: 13, listStyle: "none" }}>
                    {snippet.examples.map((ex, idx) => (
                      <Example
                        key={idx}
                        text={ex.example}
                        translation={ex.translation}
                        revealLabel={t.snippetCard.hoverToReveal}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {snippet.contextualExplanation && (
                <div className="snippet-container">
                  <strong className="snippet-header">{t.snippetCard.contextualExplanation}:</strong>
                  <p style={{ margin: "4px 0", fontSize: 13, color: "#4b5563" }}>
                    {snippet.contextualExplanation}
                  </p>
                </div>
              )}

              {snippet.explanations && (
                <div className="snippet-container">
                  <strong className="snippet-header">{t.snippetCard.grammarUsage}:</strong>
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {snippet.explanations}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {snippet.translation && (
                <div className="snippet-container">
                  <strong className="snippet-header">{t.snippetCard.translation}:</strong>
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

              {'createdAt' in snippet && snippet.createdAt && (
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
                  {t.common.created}: {new Date(snippet.createdAt).toLocaleString()}
                </div>
              )}
           </>
        </div>

        {onDelete && (
          <div>
            <button
              onClick={() => onDelete(snippet._id)}
              disabled={saving}
              className="delete-button"
            >
              {t.common.delete}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}