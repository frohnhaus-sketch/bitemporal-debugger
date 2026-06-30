"use client";

import { useDemoStore } from "@/state/demoStore";
import { revenueMismatchScenario } from "../scenarios/revenueMismatchScenario";

export function MessageOverlay() {
  const { currentIndex } = useDemoStore();
  const scene = revenueMismatchScenario[currentIndex];

  if (!scene) return null;

  const messages: Record<string, string> = {
    "business-alarm":
      "A green pipeline does not guarantee a correct historical answer.",
    "data-looks-clean":
      "Classic checks only prove that the data is technically usable, not historically meaningful.",
    "wrong-result":
      "The mismatch appears exactly where facts meet historical dimensions.",
    "first-hypotheses":
      "The next step is to inspect how time is used in the join.",
    "temporal-join":
      "Joining only by customer_id answers the wrong question: who is this customer now, not who were they then.",
    "root-cause":
      "The missing time condition silently rewrites the past.",
    "business-impact":
      "This is the core promise of the Bitemporal Debugger: explain wrong business answers caused by historical modeling errors.",
  };

  return (
    <div
      style={{
        marginTop: 24,
        fontSize: 16,
        color: "rgba(255,255,255,0.6)",
        lineHeight: 1.6,
      }}
    >
      {messages[scene.id]}
    </div>
  );
}