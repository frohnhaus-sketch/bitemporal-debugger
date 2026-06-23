"use client";

import { useDemoStore } from "@/state/demoStore";

export function MessageOverlay() {
  const { currentIndex } = useDemoStore();

  const messages = [
    "",
    "Data evolves over time.",
    "But most systems overwrite history.",
    "This makes past queries unreliable.",
  ];

  if (!messages[currentIndex]) return null;

  return (
    <div
      style={{
        marginTop: 24,
        fontSize: 16,
        color: "rgba(255,255,255,0.6)",
        lineHeight: 1.6,
      }}
    >
      {messages[currentIndex]}
    </div>
  );
}
