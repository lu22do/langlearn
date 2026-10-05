import { useState } from "react";
import { Globe } from "lucide-react";

interface ExampleProps {
  text: string;
  translation: string;
  revealLabel: string;
}

export default function Example({ text, translation, revealLabel }: ExampleProps) {
  const [isExampleHovered, setIsExampleHovered] = useState(false);
  const [isIconFocused, setIsIconFocused] = useState(false);
  const [isTranslationVisible, setIsTranslationVisible] = useState(false);

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 6,
        marginBottom: 4,
        padding: "6px 8px",
        borderRadius: 4,
        position: "relative"
      }}
      onMouseEnter={() => setIsExampleHovered(true)}
      onMouseLeave={() => {
        setIsExampleHovered(false);
        setIsTranslationVisible(false);
      }}
    >
      <div style={{ color: "#1f2937", fontWeight: 500 }}>{text}</div>
      <div style={{ flexShrink: 0 }} onMouseLeave={() => setIsTranslationVisible(false)}>
        <button
          type="button"
          aria-label={revealLabel}
          aria-expanded={isTranslationVisible}
          onMouseEnter={() => setIsTranslationVisible(true)}
          onFocus={() => {
            setIsIconFocused(true);
            setIsTranslationVisible(true);
          }}
          onBlur={() => {
            setIsIconFocused(false);
            setIsTranslationVisible(false);
          }}
          style={{
            border: 0,
            background: "transparent",
            padding: 2,
            cursor: "pointer",
            color: "#4b5563",
            display: "flex",
            alignItems: "center",
            opacity: isExampleHovered || isIconFocused ? 1 : 0,
            transition: "opacity 0.15s"
          }}
        >
          <Globe size={12} aria-hidden="true" />
        </button>
        {isTranslationVisible && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: "calc(100% + 4px)",
              padding: "8px 12px",
              background: "#1f2937",
              color: "#fff",
              fontSize: 12,
              borderRadius: 6,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              zIndex: 10,
              boxSizing: "border-box",
              maxWidth: "calc(100vw - 32px)",
              whiteSpace: "normal"
            }}
          >
            {translation}
          </div>
        )}
      </div>
    </li>
  );
}