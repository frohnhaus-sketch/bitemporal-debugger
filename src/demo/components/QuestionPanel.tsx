"use client";

import { useState } from "react";
import { useDemoStore } from "@/state/demoStore";
import { revenueMismatchScenario } from "../scenarios/revenueMismatchScenario";

export function QuestionPanel() {
  const { currentIndex } = useDemoStore();
  const scene = revenueMismatchScenario[currentIndex];

  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  if (!scene?.choices) return null;

  const selectedChoice = scene.choices.find((c) => c.id === selectedChoiceId);

  return (
    <div
      style={{
        marginTop: 40,
        padding: 28,
        borderRadius: 16,
        background: "rgba(251,191,36,0.08)",
        border: "1px solid rgba(251,191,36,0.25)",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.6, textTransform: "uppercase" }}>
        Investigation choice
      </div>

      <h3 style={{ fontSize: 22, marginTop: 8 }}>{scene.title}</h3>

      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        {scene.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;

          return (
            <button
              key={choice.id}
              onClick={() => setSelectedChoiceId(choice.id)}
              style={{
                textAlign: "left",
                padding: "14px 16px",
                borderRadius: 12,
                border: isSelected
                  ? "1px solid rgba(255,255,255,0.65)"
                  : "1px solid rgba(255,255,255,0.12)",
                background: isSelected
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(255,255,255,0.04)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 15,
              }}
            >
              {choice.label}
            </button>
          );
        })}
      </div>

      {selectedChoice && (
        <div
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 12,
            background: selectedChoice.correct
              ? "rgba(34,197,94,0.12)"
              : "rgba(239,68,68,0.10)",
            border: selectedChoice.correct
              ? "1px solid rgba(34,197,94,0.30)"
              : "1px solid rgba(239,68,68,0.25)",
            color: selectedChoice.correct ? "#bbf7d0" : "#fecaca",
            lineHeight: 1.5,
          }}
        >
          {selectedChoice.correct ? "Correct. " : "Not quite. "}
          {selectedChoice.feedback}
        </div>
      )}
    </div>
  );
}