"use client";

import { goalOptions, sourceOptions } from "./sketchQuestions";
import { useSketch, type Goal, type SourceId } from "./useSketch";
import { QuestionCard } from "./components/QuestionCard";
import { OptionGrid } from "./components/OptionGrid";
import { PipelineCanvas } from "./components/PipelineCanvas";
import { ThinkingPanel } from "./components/ThinkingPanel";

export function SketchRuntime() {
  const {
    goal,
    sources,
    currentStep,
    setGoal,
    toggleSource,
    markSourceHistorical,
    nextStep,
    reset,
  } = useSketch();

  const selectedSourceIds = sources.map((s) => s.id);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 32,
        color: "#fff",
        background:
          "radial-gradient(circle at 20% 0%, rgba(59,130,246,0.16), transparent 32%), #020617",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "420px 1fr",
          gap: 28,
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <section
          style={{
            padding: 30,
            borderRadius: 28,
            background: "rgba(15,23,42,0.72)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          {currentStep === 0 && (
            <QuestionCard
              eyebrow="Historical Pipeline Sketch"
              title="What are you building?"
            >
              <OptionGrid
                options={goalOptions}
                selectedIds={goal ? [goal] : []}
                onSelect={(id) => setGoal(id as Goal)}
              />
            </QuestionCard>
          )}

          {currentStep === 1 && (
            <QuestionCard
              eyebrow="Data sources"
              title="Which datasets feed this report?"
            >
              <OptionGrid
                options={sourceOptions.map((s) => ({
                  id: s.id,
                  label: s.label,
                  icon: "📦",
                }))}
                selectedIds={selectedSourceIds}
                onSelect={(id) => {
                  const source = sourceOptions.find((s) => s.id === id);
                  if (source) toggleSource(source);
                }}
              />

              {sources.length > 0 && (
                <button onClick={nextStep} style={continueStyle}>
                  Looks right →
                </button>
              )}
            </QuestionCard>
          )}

          {currentStep === 2 && (
            <QuestionCard
              eyebrow="History"
              title="Which datasets change over time?"
            >
              <div style={{ display: "grid", gap: 12 }}>
                {sources.map((source) => (
                  <div
                    key={source.id}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.055)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>{source.label}</div>

                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                      <button
                        onClick={() =>
                          markSourceHistorical(source.id as SourceId, true)
                        }
                        style={smallButtonStyle(source.historical)}
                      >
                        Yes, it changes
                      </button>

                      <button
                        onClick={() =>
                          markSourceHistorical(source.id as SourceId, false)
                        }
                        style={smallButtonStyle(!source.historical)}
                      >
                        No / mostly static
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={nextStep} style={continueStyle}>
                Continue →
              </button>
            </QuestionCard>
          )}

          {currentStep === 3 && (
            <QuestionCard
              eyebrow="First questions"
              title="What I would investigate first"
            >
              <ThinkingPanel />

              <button
                style={{
                  ...continueStyle,
                  width: "100%",
                  marginTop: 24,
                  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                }}
              >
                Start sample investigation →
              </button>

              <button
                onClick={reset}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 14,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.65)",
                  cursor: "pointer",
                }}
              >
                Reset sketch
              </button>
            </QuestionCard>
          )}
        </section>

        <PipelineCanvas />
      </div>
    </main>
  );
}

const continueStyle = {
  marginTop: 22,
  padding: "14px 18px",
  borderRadius: 16,
  border: "none",
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

function smallButtonStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: active
      ? "1px solid rgba(196,181,253,0.55)"
      : "1px solid rgba(255,255,255,0.10)",
    background: active ? "rgba(124,58,237,0.22)" : "rgba(255,255,255,0.045)",
    color: "#fff",
    cursor: "pointer",
  };
}
