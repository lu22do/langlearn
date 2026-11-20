import React from "react";
import type { SnippetState } from "../../server/models/Snippet.js";
import { useLocalization } from "../contexts/LocalizationContext";

interface StateBadgeProps {
  state?: SnippetState;
  compact?: boolean;
}

export function StateBadge({ state = "new", compact = false }: StateBadgeProps) {
  const { t } = useLocalization();

  const config = {
    new: {
      label: t.state.new,
      bg: "#eff6ff",
      color: "#1d4ed8",
      border: "#bfdbfe",
    },
    "still learning": {
      label: t.state.stillLearning,
      bg: "#fffbeb",
      color: "#b45309",
      border: "#fde68a",
    },
    known: {
      label: t.state.known,
      bg: "#f0fdf4",
      color: "#15803d",
      border: "#bbf7d0",
    },
  }[state] || {
    label: state,
    bg: "#f3f4f6",
    color: "#374151",
    border: "#e5e7eb",
  };

  return (
    <span
      style={{
        display: "inline-block",
        padding: compact ? "2px 6px" : "4px 8px",
        fontSize: compact ? 11 : 12,
        fontWeight: 600,
        borderRadius: 9999,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {config.label}
    </span>
  );
}

interface StateSelectorProps {
  currentState?: SnippetState;
  onChange?: (newState: SnippetState) => void;
  disabled?: boolean;
  compact?: boolean;
}

export default function StateSelector({
  currentState = "new",
  onChange,
  disabled = false,
  compact = false,
}: StateSelectorProps) {
  const { t } = useLocalization();

  const states: Array<{
    key: SnippetState;
    label: string;
    activeBg: string;
    activeColor: string;
    activeBorder: string;
  }> = [
    {
      key: "new",
      label: t.state.new,
      activeBg: "#dbeafe",
      activeColor: "#1e40af",
      activeBorder: "#3b82f6",
    },
    {
      key: "still learning",
      label: t.state.stillLearning,
      activeBg: "#fef3c7",
      activeColor: "#92400e",
      activeBorder: "#f59e0b",
    },
    {
      key: "known",
      label: t.state.known,
      activeBg: "#dcfce7",
      activeColor: "#166534",
      activeBorder: "#22c55e",
    },
  ];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 4 : 6,
        flexWrap: "wrap",
      }}
    >
      {states.map((s) => {
        const isActive = currentState === s.key;
        return (
          <button
            key={s.key}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!isActive && onChange) {
                onChange(s.key);
              }
            }}
            style={{
              padding: compact ? "3px 8px" : "6px 12px",
              fontSize: compact ? 12 : 13,
              fontWeight: isActive ? 600 : 500,
              borderRadius: 6,
              cursor: disabled ? "not-allowed" : isActive ? "default" : "pointer",
              border: `1px solid ${isActive ? s.activeBorder : "#d1d5db"}`,
              backgroundColor: isActive ? s.activeBg : "#ffffff",
              color: isActive ? s.activeColor : "#4b5563",
              transition: "all 0.15s ease",
              margin: 0,
              boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
