import React, { useEffect, useState } from "react";
import type { ISnippet } from "../../server/models/Snippet.js";
import { useLocalization } from "../contexts/LocalizationContext";

type SnippetType = Omit<ISnippet, keyof Document> & { _id?: string };
type ReviewPhase = "empty" | "context" | "examples" | "translation";

function shuffleSnippets<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getNextPhase(phase: ReviewPhase): ReviewPhase {
  switch (phase) {
    case "empty":
      return "context";
    case "context":
      return "examples";
    case "examples":
    default:
      return "translation";
  }
}

function getPreviousPhase(phase: ReviewPhase): ReviewPhase {
  switch (phase) {
    case "translation":
      return "examples";
    case "examples":
      return "context";
    case "context":
      return "empty";
    case "empty":
    default:
      return "empty";
  }
}

export default function Review() {
  const { t } = useLocalization();
  const [snippets, setSnippets] = useState<SnippetType[]>([]);
  const [reviewQueue, setReviewQueue] = useState<SnippetType[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<ReviewPhase>("empty");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSnippets = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/snippets");
        if (!response.ok) {
          throw new Error("Failed to load snippets");
        }

        const data: SnippetType[] = await response.json();
        const shuffled = shuffleSnippets(data).slice(0, Math.min(data.length, 10));
        setSnippets(shuffled);
        setReviewQueue(shuffled);
        setActiveIndex(0);
        setPhase("empty");
      } catch (err: any) {
        setError(err?.message ?? t.learn.failedToLoad);
      } finally {
        setLoading(false);
      }
    };

    loadSnippets();
  }, [t.learn.failedToLoad]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!reviewQueue.length || loading) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setPhase((current) => getNextPhase(current));
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setPhase((current) => getPreviousPhase(current));
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNextSnippet();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPreviousSnippet();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, reviewQueue.length]);

  const currentSnippet = reviewQueue[activeIndex];

  const goToNextSnippet = () => {
    if (!reviewQueue.length) {
      return;
    }

    setActiveIndex((current) => (current + 1) % reviewQueue.length);
    setPhase("empty");
  };

  const goToPreviousSnippet = () => {
    if (!reviewQueue.length) {
      return;
    }

    setActiveIndex((current) => (current - 1 + reviewQueue.length) % reviewQueue.length);
    setPhase("empty");
  };

  const renderDetailBody = () => {
    if (!currentSnippet) {
      return <p style={{ color: "#6b7280" }}>{t.common.loading}</p>;
    }

    switch (phase) {
      case "context":
        return (
          <p style={{ margin: 0, color: "#374151", lineHeight: 1.6 }}>
            {currentSnippet.sourceContext || t.learn.noContext}
          </p>
        );
      case "examples":
        return currentSnippet.examples && currentSnippet.examples.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: 20, color: "#374151", lineHeight: 1.6 }}>
            {currentSnippet.examples.map((example, index) => (
              <li key={`${example.example}-${index}`} style={{ marginBottom: 10 }}>
                <div><strong>{example.example}</strong></div>
                <div style={{ color: "#6b7280" }}>{example.translation}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, color: "#6b7280" }}>{t.learn.noExamples}</p>
        );
      case "translation":
        return (
          <p style={{ margin: 0, color: "#374151", lineHeight: 1.6 }}>
            {currentSnippet.translation || t.learn.noTranslation}
          </p>
        );
      case "empty":
      default:
        return <p></p>;
    }
  };

  return (
    <section>
      <h1>{t.learn.title}</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        {t.learn.subtitle}
      </p>

      {loading && <p>{t.common.loading}</p>}

      {error && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fee", border: "1px solid #fcc", borderRadius: 6, color: "#c00" }}>
          {error}
        </div>
      )}

      {!loading && !error && reviewQueue.length > 0 && currentSnippet && (
        <div style={{ maxWidth: 800 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <strong>
              {t.learn.progress}: {activeIndex + 1}/{reviewQueue.length}
            </strong>
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, background: "#fff", minHeight: 220 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, color: "#6b7280", fontSize: 14 }}>{t.learn.rawText}</div>
              <div style={{ whiteSpace: "pre-wrap", color: "#111827", lineHeight: 1.7 }}>
                {currentSnippet.rawText}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
              <div style={{ marginBottom: 12, color: "#6b7280", fontSize: 14 }}>
                {phase === "empty" && ""}
                {phase === "context" && t.learn.context}
                {phase === "examples" && t.learn.examples}
                {phase === "translation" && t.learn.translation}
              </div>
              {renderDetailBody()}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <button onClick={() => setPhase("context")}>{t.learn.revealContext}</button>
            <button onClick={() => setPhase("examples")}>{t.learn.revealExamples}</button>
            <button onClick={() => setPhase("translation")}>{t.learn.revealTranslation}</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <button onClick={goToPreviousSnippet}>{t.learn.previousSnippet}</button>
            <button onClick={goToNextSnippet}>{t.learn.nextSnippet}</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <span style={{ color: "#9ca3af", fontSize: 16 }}>{t.learn.keyboardHint}</span>
          </div>
        </div>
      )}

      {!loading && !error && reviewQueue.length === 0 && (
        <p style={{ color: "#6b7280" }}>{t.learn.noSnippets}</p>
      )}
    </section>
  );
}