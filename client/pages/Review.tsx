import React from "react";
import { useLocalization } from "../contexts/LocalizationContext";

export default function Review() {
  const { t } = useLocalization();
  
  return (
    <section>
      <h1>{t.learn.title}</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        {t.learn.subtitle}
      </p>
      <p style={{ fontStyle: "italic", color: "#9ca3af" }}>
        {t.learn.comingSoon}
      </p>
    </section>
  );
}