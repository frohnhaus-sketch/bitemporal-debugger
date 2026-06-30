import { investigationSteps } from "../InvestigationScenario";

export function InvestigationSidebar({
  currentStep,
  onSelectStep,
}: {
  currentStep: number;
  onSelectStep: (index: number) => void;
}) {
  return (
    <aside
      style={{
        width: 280,
        borderRight: "1px solid rgba(255,255,255,0.08)",
        padding: 28,
        background: "rgba(2,6,23,0.55)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#93c5fd",
          marginBottom: 28,
        }}
      >
        Investigation story
      </div>

      <div style={{ display: "grid", gap: 22 }}>
        {investigationSteps.map((step, index) => {
          const active = index === currentStep;
          const done = index < currentStep;

          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(index)}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr auto",
                gap: 14,
                alignItems: "start",
                textAlign: "left",
                background: "transparent",
                border: "none",
                padding: 0,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  background: active
                    ? "rgba(124,58,237,0.9)"
                    : done
                      ? "rgba(45,212,191,0.5)"
                      : "rgba(255,255,255,0.10)",
                  boxShadow: active
                    ? "0 0 0 6px rgba(124,58,237,0.18)"
                    : "none",
                }}
              >
                {index + 1}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: active ? "#c4b5fd" : done ? "#5eead4" : "#fff",
                  }}
                >
                  {step.label}
                </div>
                <div
                  style={{
                    marginTop: 7,
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: "rgba(255,255,255,0.52)",
                  }}
                >
                  {step.description}
                </div>
              </div>

              <div style={{ fontSize: 12, opacity: 0.48 }}>{step.time}</div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}