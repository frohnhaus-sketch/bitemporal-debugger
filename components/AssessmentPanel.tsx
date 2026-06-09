import type { SourcePatternResult } from "@/lib/sourcePatterns";
import { ValidationContextPanel } from "@/components/ValidationContextPanel";

type Props = {
  sourcePatterns: {
    sourceA: SourcePatternResult | null;
    sourceB: SourcePatternResult | null;
  };
  relationshipAnalysis: any;
  relationshipComplexityStyle: any;
  historicalPatterns: any[];
  isMobile: boolean;
  analysisRef: React.RefObject<HTMLDivElement | null>;
  validationContextRef: React.RefObject<HTMLDivElement | null>;
  guidedDemoStep: number | null;
  asOfDate: string;
  visibleAsOf: string;
  setAsOfDate: (value: string) => void;
  setVisibleAsOf: (value: string) => void;
  resetDates: () => void;
};

export function AssessmentPanel({
  sourcePatterns,
  relationshipAnalysis,
  relationshipComplexityStyle,
  historicalPatterns,
  isMobile,
  analysisRef,
  validationContextRef,
  guidedDemoStep,
  asOfDate,
  visibleAsOf,
  setAsOfDate,
  setVisibleAsOf,
  resetDates,
}: Props) {
  if (!sourcePatterns.sourceA || !sourcePatterns.sourceB) return null;

  return (
    <>
        <>
          <details
            open
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 14,
              marginTop: 18,
              marginBottom: 18,
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                fontSize: 18,
                fontWeight: 700,
                color: "#475569",
                marginBottom: 12,
              }}
            >
              Historical Modeling Assessment
            </summary>
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 0.7,
                  color: "#64748b",
                  marginBottom: 8,
                }}
              >
                Detected Historical Relationship
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                {relationshipAnalysis?.relationship}
              </div>
              {relationshipComplexityStyle && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: relationshipComplexityStyle.background,
                    border: `1px solid ${relationshipComplexityStyle.border}`,
                    color: relationshipComplexityStyle.color,
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 0,
                  }}
                >
                  {relationshipComplexityStyle.label}
                </div>
              )}
              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                    color: "#64748b",
                    marginBottom: 8,
                  }}
                >
                  Suggested Action
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    lineHeight: 1.25,
                  }}
                >
                  {relationshipAnalysis?.recommendation}
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 0.7,
                  color: "#64748b",
                  marginTop: 12,
                  marginBottom: 8,
                }}
              >
                Potential Risks
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {relationshipAnalysis?.challenges.map((challenge: string) => (
                  <div
                    key={challenge}
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      borderRadius: 999,
                      padding: "6px 10px",
                      fontSize: 13,
                    }}
                  >
                    {challenge}
                  </div>
                ))}
              </div>
            {historicalPatterns.length > 0 && (
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                    color: "#64748b",
                    marginBottom: 8,
                  }}
                >
                  Validation Findings
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                    marginBottom: 12,
                  }}
                >
                  Investigate the findings below to understand the root cause and historical impact.
                </div>
                {historicalPatterns.map((pattern: any) => {
                  const isPossiblePattern =
                    pattern.name.startsWith("Possible");
                
                  return (
                    <div
                      key={pattern.name}
                      style={{
                        background: isPossiblePattern
                          ? "#fffbeb"
                          : "#fef2f2",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        border: isPossiblePattern
                          ? "1px solid #fde68a"
                          : "1px solid #fecaca",
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 8,
                      }}
                      onClick={() => {
                        analysisRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          marginBottom: 4,
                          color: isPossiblePattern
                            ? "#92400e"
                            : "#b91c1c",
                        }}
                      >
                        {pattern.name}
                      </div>
                    
                      <div
                        style={{
                          fontSize: 13,
                          color: "#334155",
                        }}
                      >
                      <div
                        style={{
                          marginBottom: 8,
                          fontSize: 12,
                          color: "#64748b",
                        }}
                      >
                        <strong>Evidence</strong>
                    
                        {pattern.evidence.map((item: string) => (
                          <div key={item}>
                            • {item}
                          </div>
                        ))}
                      </div>
                        {pattern.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
            <details
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 14,
                color: "#0f172a",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                marginTop: 8,
              }}
            >
              <summary
              style={{
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 700,
                color: "#475569",
              }}
              >
                Source Characteristics
              </summary>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 16,
                  marginTop: 16,
                }}
              >
                {[sourcePatterns.sourceA, sourcePatterns.sourceB].map(
                  (pattern, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        padding: 16,
                        background: "#f8fafc",
                        minWidth: 0,
                        boxSizing: "border-box",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          marginBottom: 4,
                        }}
                      >
                        {index === 0 ? "Source A" : "Source B"}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: 0.7,
                          color: "#64748b",
                          marginBottom: 6,
                        }}
                      >
                        Detected Pattern
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          marginBottom: 14,
                        }}
                      >
                        {pattern.label.replace("Likely ", "")}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: 0.7,
                          color: "#64748b",
                          marginBottom: 8,
                        }}
                      >
                        Indicators
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          marginBottom: 16,
                        }}
                      >
                        {pattern.indicators.map((indicator: string) => (
                          <div
                            key={indicator}
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                            }}
                          >
                            <span style={{ color: "#16a34a", fontWeight: 700 }}>
                              ✓
                            </span>
                            <span>{indicator}</span>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          padding: 14,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: 0.7,
                            color: "#64748b",
                            marginBottom: 8,
                          }}
                        >
                          Validation Notes
                        </div>
                        <div
                          style={{
                            color: "#334155",
                            lineHeight: 1.5,
                          }}
                        >
                          {pattern.modelingInsight}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </details>
          </details>
          <ValidationContextPanel
            validationContextRef={validationContextRef}
            guidedDemoStep={guidedDemoStep}
            asOfDate={asOfDate}
            visibleAsOf={visibleAsOf}
            setAsOfDate={setAsOfDate}
            setVisibleAsOf={setVisibleAsOf}
            resetDates={resetDates}
          />
        </>
    </>
  );
}