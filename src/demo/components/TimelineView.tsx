"use client";

import { useDemoStore } from "@/state/demoStore";
import { revenueMismatchScenario } from "../scenarios/revenueMismatchScenario";

export function TimelineView() {
  const { currentIndex, setCurrentIndex, flowState } = useDemoStore();

  const locked =
    flowState === "loading_demo" ||
    flowState === "demo_static" ||
    flowState === "auto_highlight";

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 8 }}>
        Investigation timeline
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        {revenueMismatchScenario.map((scene, index) => {
          const active = index === currentIndex;

          return (
            <button
              key={scene.id}
              onClick={() => {
                if (locked) return;
                setCurrentIndex(index);
              }}
              title={scene.title}
              style={{
                width: active ? 28 : 8,
                height: 8,
                borderRadius: 999,
                cursor: locked ? "default" : "pointer",
                background: active ? "#fff" : "rgba(255,255,255,0.3)",
                border: "none",
                padding: 0,
                transition: "all 200ms ease",
                opacity: locked ? 0.4 : 1,
                pointerEvents: locked ? "none" : "auto",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}