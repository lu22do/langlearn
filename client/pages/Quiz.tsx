import React, { useEffect, useState } from "react";
import { useLocalization } from "../contexts/LocalizationContext";

type QuizQuestion = {
  rawText: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
};

export default function Quiz() {
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const fetchQuiz = async () => {
    setLoading(true);
    setError(null);
    setQuiz([]);
    setIndex(0);
    setSelected(null);
    setScore(0);

    try {
      const res = await fetch('/api/quiz?size=5');
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch quiz');
      const data = await res.json();
      setQuiz(data.quiz || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (choiceIdx: number) => {
    if (selected !== null) return; // already answered
    setSelected(choiceIdx);
    const q = quiz[index];
    if (q && choiceIdx === q.answerIndex) setScore((s) => s + 1);
  };

  const next = () => {
    setSelected(null);
    setIndex((i) => i + 1);
  };

  if (loading) return <section><h1>{t.quiz.title}</h1><p>{t.common.loading}</p></section>;
  if (error) return <section><h1>{t.quiz.title}</h1><p style={{ color: 'red' }}>{error}</p></section>;
  if (!quiz || quiz.length === 0) {
    return (
      <section>
        <h1>{t.quiz.title}</h1>
        <p style={{ color: "#6b7280", marginBottom: 12 }}>{t.quiz.subtitle}</p>
        <button onClick={fetchQuiz} style={{ padding: "8px 16px" }}>
          Generate quiz
        </button>
      </section>
    );
  }

  if (index >= quiz.length) {
    return (
      <section>
        <h1>{t.quiz.title}</h1>
        <p style={{ color: "#6b7280", marginBottom: 12 }}>{t.quiz.subtitle}</p>
        <button onClick={fetchQuiz} style={{ padding: "8px 16px", marginBottom: 16 }}>
          Generate quiz
        </button>
        <p style={{ fontWeight: 600 }}>Your score: {score} / {quiz.length}</p>
      </section>
    );
  }

  const cur = quiz[index];

  return (
    <section>
      <h1>{t.quiz.title}</h1>
      <p style={{ color: "#6b7280", marginBottom: 12 }}>{t.quiz.subtitle}</p>

      <button onClick={fetchQuiz} style={{ padding: "8px 16px", marginBottom: 16 }}>
        Generate quiz
      </button>

      <div style={{ marginTop: 12, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>{cur.rawText}</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{cur.question}</div>

        <div style={{ display: 'grid', gap: 8 }}>
          {cur.choices.map((c, idx) => {
            const isSelected = selected === idx;
            const isCorrect = idx === cur.answerIndex;
            const bg = selected === null ? '#6c6f78ff' : isSelected ? (isCorrect ? '#065f46' : '#b91c1c') : (isCorrect ? '#4e6957ff' : '#828080ff');
            return (
              <button key={idx} onClick={() => onSelect(idx)} disabled={selected !== null}
                style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: bg, textAlign: 'left', cursor: selected === null ? 'pointer' : 'default' }}>
                {c}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div style={{ marginTop: 12 }}>
            <div style={{ color: selected === cur.answerIndex ? '#065f46' : '#b91c1c', marginBottom: 8, fontWeight: 600 }}>
              {selected === cur.answerIndex ? 'Correct' : `Incorrect — Correct answer: ${cur.choices[cur.answerIndex]}`}
            </div>
            {cur.explanation && <div style={{ color: '#374151' }}>{cur.explanation}</div>}
            <div style={{ marginTop: 12 }}>
              <button onClick={next} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb' }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}