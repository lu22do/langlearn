import React from "react";
import { useLocalization } from "../contexts/LocalizationContext";

export default function Quiz() {
  const { t } = useLocalization();
  
  return (
    <section>
      <h1>{t.quiz.title}</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        {t.quiz.subtitle}
      </p>
      <p style={{ fontStyle: "italic", color: "#9ca3af" }}>
        {t.quiz.comingSoon}
      </p>
    </section>
  );
}