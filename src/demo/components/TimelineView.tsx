"use client";

import { useDemoStore } from "@/state/demoStore";
import { customerChangeScenario } from "../scenarios/customerChangeScenario";

export function TimelineView() {
  const { currentIndex, setCurrentIndex } = useDemoStore();
  const { flowState } = useDemoStore();

  const locked =
    flowState === "loading_demo" ||
    flowState === "demo_static" ||
    flowState === "auto_highlight";

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 8 }}>
        Timeline
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        {customerChangeScenario.map((item, index) => {
          const active = index === currentIndex;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (locked) return;
                setCurrentIndex(index);
              }}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                cursor: "pointer",
                background: active ? "#fff" : "rgba(255,255,255,0.3)",
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
