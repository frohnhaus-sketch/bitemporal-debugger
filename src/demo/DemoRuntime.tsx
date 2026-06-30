"use client";

import { useEffect, useState } from "react";
import { QuestionPanel } from "./components/QuestionPanel";
import { useFlowController } from "./useFlowController";
import { useDemoStore } from "@/state/demoStore";

import { SceneRenderer } from "./components/SceneRenderer";
import { TimelineView } from "./components/TimelineView";
import { MessageOverlay } from "./components/MessageOverlay";

export function DemoRuntime() {
  const { flowState, setFlowState, currentIndex, focus } = useDemoStore();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showReveal, setShowReveal] = useState(false);

  useFlowController();

  // transition to reveal
  useEffect(() => {
    if (flowState === "reveal") {
      setIsTransitioning(true);

      const t = setTimeout(() => {
        setShowReveal(true);
      }, 400);

      return () => clearTimeout(t);
    }
  }, [flowState]);

  // LANDING
  if (flowState === "landing") {
    return (
      <div style={{ padding: 40, color: "#fff" }}>
        <h1>Your data looks correct. Your numbers are wrong.</h1>

        <p style={{ maxWidth: 620, opacity: 0.7, lineHeight: 1.6 }}>
          Investigate why a clean historical data model produces the wrong
          customer revenue.
        </p>

        <button onClick={() => setFlowState("loading_demo")}>
          ▶ Start Investigation
        </button>
      </div>
    );
  }

  // REVEAL
  if (showReveal) {
    return (
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          color: "#fff",
          padding: 80,
        }}
      >
        <h1 style={{ fontSize: 42 }}>Most systems lose history.</h1>

        <div style={{ marginTop: 20, opacity: 0.7 }}>
          But real-world data is temporal.
        </div>

        <div
          style={{
            marginTop: 40,
            padding: 24,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ opacity: 0.6, fontSize: 12 }}>Correct model</div>

          <div style={{ marginTop: 12, fontSize: 18 }}>
            Jan → Berlin → Mar → Munich → Jul → Zurich
          </div>
        </div>

        <div style={{ marginTop: 40 }}>
          <button
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              background: "#fff",
              color: "#000",
              border: "none",
            }}
          >
            Explore Patterns →
          </button>
        </div>
      </div>
    );
  }

  // DEFAULT FLOW
  return (
    <div
      style={{
        padding: 40,
        opacity: focus === "reveal" ? 0 : 1,
        transition: "all 400ms ease",
        position: "relative",
        color: "#fff",
        transform: isTransitioning ? "scale(0.98)" : "scale(1)",
      }}
    >
      <div>
        <SceneRenderer />
        <TimelineView />
        <QuestionPanel />
        <MessageOverlay />
      </div>
    </div>
  );
}
