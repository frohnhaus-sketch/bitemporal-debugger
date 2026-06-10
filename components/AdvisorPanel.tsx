"use client";

import { track } from "@/lib/analytics";
import { useMemo, useState } from "react";
import {
  AdvisorAnswers,
  DimensionNeed,
  ReportingGoal,
  SourceType,
  YesNoUnknown,
  generateAdvisorBlueprint,
  generateAdvisorMarkdown,
} from "@/lib/advisor";

export function AdvisorPanel() {
  const [answers, setAnswers] = useState<AdvisorAnswers>({
    reportingGoal: "SNAPSHOT",
    sourceTypes: ["State Records", "Events"],
    historyCorrected: "UNKNOWN",
    multipleSystems: "NO",
    changingRelationships: "NO",
    historizedDimensions: "SCD2",
  });

  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const blueprint = useMemo(() => generateAdvisorBlueprint(answers), [answers]);

  const markdown = useMemo(
    () => generateAdvisorMarkdown(answers, blueprint),
    [answers, blueprint]
  );

  const selectedSummary = [
    getReportingGoalLabel(answers.reportingGoal),
    ...answers.sourceTypes,
    answers.historizedDimensions !== "NO"
      ? getDimensionLabel(answers.historizedDimensions)
      : null,
    answers.historyCorrected === "YES" ? "late or corrected history" : null,
    answers.multipleSystems === "YES" ? "multiple systems" : null,
    answers.changingRelationships === "YES"
      ? "time-dependent relationships"
      : null,
  ].filter(Boolean);

  function toggleSourceType(sourceType: SourceType) {
    setAnswers((prev) => {
      const exists = prev.sourceTypes.includes(sourceType);

      return {
        ...prev,
        sourceTypes: exists
          ? prev.sourceTypes.filter((s) => s !== sourceType)
          : [...prev.sourceTypes, sourceType],
      };
    });
  }

  async function copyMarkdownBlueprint() {
    track("advisor_blueprint_copied", {
      recommendation: blueprint.recommendation,
      reportingGoal: answers.reportingGoal,
      sourceTypes: answers.sourceTypes.join(","),
      historyCorrected: answers.historyCorrected,
      multipleSystems: answers.multipleSystems,
      changingRelationships: answers.changingRelationships,
      historizedDimensions: answers.historizedDimensions,
      riskCount: blueprint.risks.length,
      validationCheckCount: blueprint.validationChecks.length,
      communityEvidenceCount: blueprint.communityEvidence.length,
    });
  
    await navigator.clipboard.writeText(markdown);
    setCopyState("copied");
  
    window.setTimeout(() => {
      setCopyState("idle");
    }, 2000);
  }

  return (
    <section
      style={{
        background: "#ffffff",
        color: "#0f172a",
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
      }}
    >
      <SectionEyebrow>Historical Modeling Advisor</SectionEyebrow>

      <h2 style={{ margin: "0 0 8px", fontSize: 26 }}>
        Design the model before implementation
      </h2>

      <p style={{ color: "#475569", marginTop: 0, marginBottom: 24 }}>
        Answer a few questions and get a recommended historical modeling
        blueprint.
      </p>

      <div style={{ display: "grid", gap: 18 }}>
        <QuestionBlock
          title="1. What should the final reporting model support?"
          description="Choose the main reporting behavior the historical model needs to produce."
        >
          <select
            value={answers.reportingGoal}
            onChange={(e) =>
              setAnswers({
                ...answers,
                reportingGoal: e.target.value as ReportingGoal,
              })
            }
            style={inputStyle}
          >
            <option value="CURRENT_STATE">Only current state</option>
            <option value="POINT_IN_TIME">Point-in-time reporting</option>
            <option value="SNAPSHOT">Periodic snapshot reporting</option>
            <option value="EVENT">Event-based reporting</option>
            <option value="AUDIT">Audit / correction history</option>
          </select>
        </QuestionBlock>

        <QuestionBlock
          title="2. What kind of source data do you have?"
          description="Select the historical behavior of your input sources."
          examples={[
            "State = valid intervals",
            "Event = point-in-time changes",
            "Journal / CDC = change log",
          ]}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SOURCE_TYPES.map((sourceType) => {
              const active = answers.sourceTypes.includes(sourceType);

              return (
                <button
                  key={sourceType}
                  type="button"
                  onClick={() => toggleSourceType(sourceType)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid #cbd5e1",
                    background: active ? "#2563eb" : "#f8fafc",
                    color: active ? "#ffffff" : "#0f172a",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {sourceType}
                </button>
              );
            })}
          </div>
        </QuestionBlock>

        <QuestionBlock
          title="3. Can source history change after it was first loaded?"
          description="Use Yes if historical records can arrive late, be backdated, corrected or replaced after reports were already produced."
          examples={[
            "Backdated contract change",
            "Corrected customer status",
            "Late-arriving source record",
          ]}
        >
          <select
            value={answers.historyCorrected}
            onChange={(e) =>
              setAnswers({
                ...answers,
                historyCorrected: e.target.value as YesNoUnknown,
              })
            }
            style={inputStyle}
          >
            <option value="YES">Yes, history can change later</option>
            <option value="NO">No, history is stable once loaded</option>
            <option value="UNKNOWN">Unknown / not sure</option>
          </select>
        </QuestionBlock>

        <QuestionBlock
          title="4. Does the final model combine multiple systems?"
          description="Use Yes when the reporting product joins or conforms data from different operational systems, not just multiple tables from the same source."
          examples={[
            "Policy system + customer master",
            "Contract system + CRM",
            "SAP + Salesforce",
          ]}
        >
          <select
            value={answers.multipleSystems}
            onChange={(e) =>
              setAnswers({
                ...answers,
                multipleSystems: e.target.value as "YES" | "NO",
              })
            }
            style={inputStyle}
          >
            <option value="YES">Yes, multiple systems are combined</option>
            <option value="NO">No, mostly one source system</option>
          </select>
        </QuestionBlock>

        <QuestionBlock
          title="5. Can business relationships change over time?"
          description="Use Yes when an entity can be linked to different related entities depending on the reporting date."
          examples={[
            "Customer changes advisor",
            "Contract changes owner",
            "Employee changes department",
          ]}
        >
          <select
            value={answers.changingRelationships}
            onChange={(e) =>
              setAnswers({
                ...answers,
                changingRelationships: e.target.value as "YES" | "NO",
              })
            }
            style={inputStyle}
          >
            <option value="YES">Yes, relationships are time-dependent</option>
            <option value="NO">No, relationships are mostly stable</option>
          </select>
        </QuestionBlock>

        <QuestionBlock
          title="6. How should descriptive attributes behave in reports?"
          description="This decides whether dimensions should be current-only, SCD2-style, or fully bitemporal."
          examples={["Customer segment", "Product category", "Advisor assignment"]}
        >
          <select
            value={answers.historizedDimensions}
            onChange={(e) =>
              setAnswers({
                ...answers,
                historizedDimensions: e.target.value as DimensionNeed,
              })
            }
            style={inputStyle}
          >
            <option value="NO">No dimensions needed</option>
            <option value="SCD1">Always show latest attributes</option>
            <option value="SCD2">Show attributes valid at reporting date</option>
            <option value="BITEMPORAL">
              Show attributes known at reporting snapshot
            </option>
          </select>
        </QuestionBlock>
      </div>

      <div
        style={{
          marginTop: 28,
          padding: 18,
          borderRadius: 14,
          background: "#dbeafe",
          border: "1px solid #93c5fd",
        }}
      >
        <SectionEyebrow color="#1d4ed8">Recommended Architecture</SectionEyebrow>

        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#0f172a",
            lineHeight: 1.2,
          }}
        >
          {blueprint.recommendation}
        </div>

        <div
          style={{
            marginTop: 10,
            color: "#334155",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Recommended because your selections indicate{" "}
          <strong>{selectedSummary.join(", ")}</strong>.
        </div>

        {blueprint.risks.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#475569",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Key Modeling Risks
            </div>

            {blueprint.communityEvidence.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#1e40af",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Community Evidence
                </div>
                
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  {blueprint.communityEvidence.slice(0, 3).map((item) => (
                    <div
                      key={item.pattern}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: "#ffffff",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <strong style={{ color: "#0f172a", fontSize: 13 }}>
                          {item.pattern}
                        </strong>
                      
                        <span
                          style={{
                            padding: "3px 7px",
                            borderRadius: 999,
                            background:
                              item.priority === "HIGH"
                                ? "#dcfce7"
                                : item.priority === "MEDIUM"
                                ? "#fef3c7"
                                : "#f1f5f9",
                            color:
                              item.priority === "HIGH"
                                ? "#166534"
                                : item.priority === "MEDIUM"
                                ? "#92400e"
                                : "#475569",
                            fontSize: 10,
                            fontWeight: 800,
                          }}
                        >
                          {item.priority}
                        </span>
                      </div>
                        
                      <div
                        style={{
                          color: "#475569",
                          fontSize: 12,
                          lineHeight: 1.45,
                          marginBottom: 8,
                        }}
                      >
                        {item.summary}
                      </div>
                      
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 5,
                        }}
                      >
                        {item.observedIn.slice(0, 3).map((evidence) => (
                          <span
                            key={evidence}
                            style={{
                              padding: "4px 7px",
                              borderRadius: 999,
                              background: "#eff6ff",
                              border: "1px solid #dbeafe",
                              color: "#1d4ed8",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {evidence}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {blueprint.validationChecks.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#475569",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Validation Checklist
                </div>
                
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {blueprint.validationChecks.map((check) => (
                    <span
                      key={check}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: "#ecfeff",
                        border: "1px solid #a5f3fc",
                        color: "#155e75",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      ✓ {check}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {blueprint.risks.slice(0, 4).map((risk) => (
                <span
                  key={risk}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    color: "#9a3412",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {risk}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 18,
          borderRadius: 14,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        <SectionEyebrow>Markdown Blueprint</SectionEyebrow>

        <p
          style={{
            margin: "0 0 14px",
            color: "#475569",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Generate a Markdown blueprint that can be used in project
          documentation, architecture reviews, notebooks or implementation
          tickets.
        </p>

        <button
          type="button"
          onClick={copyMarkdownBlueprint}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "#2563eb",
            color: "#ffffff",
            border: "1px solid #1d4ed8",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          {copyState === "copied"
            ? "Copied Markdown Blueprint"
            : "Copy Markdown Blueprint"}
        </button>

        <details style={{ marginTop: 14 }}>
          <summary
            style={{
              cursor: "pointer",
              fontWeight: 700,
              color: "#334155",
            }}
          >
            Preview Markdown
          </summary>

          <pre
            style={{
              marginTop: 12,
              padding: 14,
              borderRadius: 10,
              background: "#0f172a",
              color: "#e2e8f0",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            {markdown}
          </pre>
        </details>
      </div>
    </section>
  );
}

const SOURCE_TYPES: SourceType[] = [
  "State Records",
  "Events",
  "Change Log / CDC",
  "Reference Data",
  "Business Relationships",
];

function SectionEyebrow({
  children,
  color = "#2563eb",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 800,
        color,
        textTransform: "uppercase",
        letterSpacing: 0.7,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function QuestionBlock({
  title,
  description,
  examples,
  children,
}: {
  title: string;
  description: string;
  examples?: string[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <strong>{title}</strong>
      <div
        style={{
          marginTop: 4,
          color: "#64748b",
          fontSize: 13,
          lineHeight: 1.45,
        }}
      >
        {description}
      </div>

      {examples && (
        <div style={{ marginTop: 6, color: "#64748b", fontSize: 12 }}>
          Examples: {examples.join(" · ")}
        </div>
      )}

      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}

function getReportingGoalLabel(goal: ReportingGoal) {
  if (goal === "CURRENT_STATE") return "current-state reporting";
  if (goal === "POINT_IN_TIME") return "point-in-time reporting";
  if (goal === "SNAPSHOT") return "snapshot reporting";
  if (goal === "EVENT") return "event-based reporting";
  if (goal === "AUDIT") return "audit reporting";

  return "historical reporting";
}

function getDimensionLabel(dimensionNeed: DimensionNeed) {
  if (dimensionNeed === "SCD1") return "current attributes";
  if (dimensionNeed === "SCD2") return "historized dimensions";
  if (dimensionNeed === "BITEMPORAL") return "bitemporal dimensions";

  return "no dimensions";
}

const inputStyle = {
  display: "block",
  marginTop: 8,
  padding: "10px 12px",
  width: "100%",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
};