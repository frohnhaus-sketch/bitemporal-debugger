"use client";

import { useEffect, useState } from "react";
import { investigationSteps } from "./InvestigationScenario";
import { InvestigationSidebar } from "./components/InvestigationSidebar";
import { InvestigationStage } from "./components/InvestigationStage";

export function InvestigationRuntime() {
  const [currentStep, setCurrentStep] = useState(0);

  const advance = () => {
    setCurrentStep((step) =>
      Math.min(step + 1, investigationSteps.length - 1),
    );
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        advance();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goBack();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      onClick={advance}
      style={{
        minHeight: "100vh",
        color: "#fff",
        background:
          "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.18), transparent 34%), #020617",
        fontFamily: "Inter, Arial, sans-serif",
        cursor: currentStep === investigationSteps.length - 1 ? "default" : "pointer",
      }}
    >
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(15,23,42,0.38)",
        }}
      >
        <div onClick={(event) => event.stopPropagation()}>
          <InvestigationSidebar
            currentStep={currentStep}
            onSelectStep={setCurrentStep}
          />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <InvestigationStage currentStep={currentStep} />

          <div
            style={{
              padding: "0 32px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "rgba(255,255,255,0.52)",
              fontSize: 13,
            }}
          >
            <div>
              {currentStep + 1} / {investigationSteps.length}
            </div>

            <div>
              {currentStep === investigationSteps.length - 1
                ? "Investigation complete"
                : "Click anywhere, press Space or →"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}