import { investigationSteps } from "../InvestigationScenario";

export function StepControls({
  currentStep,
  setCurrentStep,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}) {
  const isLast = currentStep === investigationSteps.length - 1;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 24,
        paddingTop: 18,
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.6 }}>
        Step {currentStep + 1} of {investigationSteps.length}
      </div>

      <button
        onClick={() => {
          if (!isLast) setCurrentStep(currentStep + 1);
        }}
        style={{
          padding: "12px 18px",
          borderRadius: 12,
          border: "none",
          background: isLast
            ? "rgba(255,255,255,0.12)"
            : "linear-gradient(135deg,#7c3aed,#a855f7)",
          color: "#fff",
          fontWeight: 800,
          cursor: isLast ? "default" : "pointer",
          boxShadow: isLast ? "none" : "0 12px 30px rgba(124,58,237,0.32)",
        }}
      >
        {isLast ? "Investigation complete" : "Next step →"}
      </button>
    </div>
  );
}