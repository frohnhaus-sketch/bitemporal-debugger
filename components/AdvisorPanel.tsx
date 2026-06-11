"use client";

import { track } from "@/lib/analytics";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const hasTrackedAdvisorOpened = useRef(false);

  useEffect(() => {
    if (hasTrackedAdvisorOpened.current) return;

    hasTrackedAdvisorOpened.current = true;

    track("advisor_viewed", {
      defaultReportingGoal: "SNAPSHOT",
      defaultSourceTypes: "State Records,Events",
      defaultHistoryCorrected: "YES",
      defaultMultipleSystems: "YES",
      defaultChangingRelationships: "YES",
      defaultHistorizedDimensions: "BITEMPORAL",
    });
  }, []);

  const [answers, setAnswers] = useState<AdvisorAnswers>({
    reportingGoal: "SNAPSHOT",
    sourceTypes: ["State Records", "Events"],
    historyCorrected: "YES",
    multipleSystems: "YES",
    changingRelationships: "YES",
    historizedDimensions: "BITEMPORAL",
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

      const nextSourceTypes = exists
        ? prev.sourceTypes.filter((s) => s !== sourceType)
        : [...prev.sourceTypes, sourceType];

      track("advisor_question_changed", {
        question: "sourceTypes",
        value: nextSourceTypes.join(","),
        changedOption: sourceType,
        active: !exists,
      });

      return {
        ...prev,
        sourceTypes: nextSourceTypes,
      };
    });
  }

  function updateAnswer<K extends keyof AdvisorAnswers>(
    question: K,
    value: AdvisorAnswers[K]
  ) {
    track("advisor_question_changed", {
      question,
      value: Array.isArray(value) ? value.join(",") : String(value),
    });

    setAnswers((prev) => ({
      ...prev,
      [question]: value,
    }));
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
    <details
      open
      onToggle={(event) => {
        track("advisor_toggled", {
          open: event.currentTarget.open,
        });
      }}
      style={{
        background: "#ffffff",
        color: "#0f172a",
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          listStylePosition: "inside",
        }}
      >
        <SectionEyebrow>Historical Modeling Advisor</SectionEyebrow>
      
        <h2 style={{ margin: "0 0 8px", fontSize: 26 }}>
          Design the model before implementation
        </h2>
      
        <p style={{ color: "#475569", marginTop: 0, marginBottom: 0 }}>
          Answer a few questions and get a recommended historical modeling strategy.
        </p>
      </summary>

      <div style={{ display: "grid", gap: 18, marginTop: 24 }}>
        <QuestionBlock
          title="1. What should the final reporting model support?"
          description="Choose the main reporting behavior the historical model needs to produce."
        >
          <select
            value={answers.reportingGoal}
            onChange={(e) =>
              updateAnswer("reportingGoal", e.target.value as ReportingGoal)
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
          description="Select all source behaviors that exist in your historical model."
          examples={[
            "State = valid intervals",
            "Event = point-in-time changes",
            "Journal / CDC = change log",
            "Reference Data = product, region or category lookups",
            "Business Relationships = customer ↔ advisor, contract ↔ owner",
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
              updateAnswer("historyCorrected", e.target.value as YesNoUnknown)
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
              updateAnswer("multipleSystems", e.target.value as "YES" | "NO")
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
              updateAnswer("changingRelationships", e.target.value as "YES" | "NO")
            }
            style={inputStyle}
          >
            <option value="YES">Yes, relationships are time-dependent</option>
            <option value="NO">No, relationships are mostly stable</option>
          </select>
        </QuestionBlock>
        <QuestionBlock
          title="6. When looking at a report from last year, which attributes should be shown?"
          description="Choose how customer, product or relationship attributes should behave in historical reports."
          examples={[
            "Customer segment",
            "Product category",
            "Advisor assignment",
          ]}
        >
          <select
            value={answers.historizedDimensions}
            onChange={(e) =>
              updateAnswer("historizedDimensions", e.target.value as DimensionNeed)
            }
            style={inputStyle}
          >
            <option value="NO">No descriptive attributes are needed</option>
            <option value="SCD1">Always show today's attributes (SCD1)</option>
            <option value="SCD2">Show attributes that were valid back then (SCD2)</option>
            <option value="BITEMPORAL">Show attributes that were known back then (Bitemporal)</option>
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
        <SectionEyebrow color="#1d4ed8">
          Recommended Historical Modeling Strategy
        </SectionEyebrow>

        <div
          style={{
            fontSize: "clamp(24px, 8vw, 28px)",
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
        {blueprint.patterns.length > 0 && (
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
              Recommended Patterns
            </div>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {blueprint.patterns.slice(0, 4).map((pattern) => (
                <span
                  key={pattern}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#1d4ed8",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {pattern}
                </span>
              ))}

              {blueprint.patterns.length > 5 && (
                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "#dbeafe",
                    border: "1px solid #bfdbfe",
                    color: "#1d4ed8",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  +{blueprint.patterns.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {blueprint.communityEvidence.length > 0 && (
          <details style={{ marginTop: 18 }}>
            <summary
              style={{
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 800,
                color: "#1e40af",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Community Evidence
            </summary>
            
            <div
              style={{
                marginTop: 10,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              {blueprint.communityEvidence.map((item) => (
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
                            ? "#dbeafe"
                            : item.priority === "MEDIUM"
                            ? "#e0e7ff"
                            : "#f1f5f9",
                        color:
                          item.priority === "HIGH"
                            ? "#1d4ed8"
                            : item.priority === "MEDIUM"
                            ? "#4338ca"
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
                      color: "#64748b",
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      marginBottom: 6,
                    }}
                  >
                    Common community topics
                  </div>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
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
          </details>
        )}

        {blueprint.risks.length > 0 && (
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
              Key Modeling Risks
            </div>
            <p
              style={{
                margin: "0 0 10px",
                color: "#64748b",
                fontSize: 12,
                lineHeight: 1.45,
              }}
            >
              These risks are derived from the selected reporting goal, source behavior and
              historical complexity. They highlight what can break during implementation.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {blueprint.risks.slice(0, 5).map((risk) => (
                <span
                  key={risk}
                  title={getRiskTooltip(risk)}
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
              {blueprint.risks.length > 8 && (
                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    color: "#9a3412",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  +{blueprint.risks.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}

        {blueprint.validationChecks.length > 0 && (
          <details style={{ marginTop: 18 }}>
            <summary
              style={{
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 800,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Validation Checks
            </summary>
            
            <p
              style={{
                margin: "10px 0",
                color: "#64748b",
                fontSize: 12,
                lineHeight: 1.45,
              }}
            >
              These checks should be implemented before publishing the historical model
              or using it for reporting.
            </p>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {blueprint.validationChecks.map((check) => (
                <span
                  key={check}
                  title={getValidationCheckTooltip(check)}
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
          </details>
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
        <SectionEyebrow>Markdown Recommendation</SectionEyebrow>

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
            ? "Copied Markdown Recommendation"
            : "Copy Markdown Recommendation"}
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

          <div
            style={{
              marginTop: 12,
              padding: 16,
              borderRadius: 10,
              background: "#0f172a",
              color: "#e2e8f0",
              overflowX: "auto",
              fontSize: 13,
              lineHeight: 1.6,
              maxHeight: 520,
              overflowY: "auto",
            }}
          >
            {renderMarkdownPreview(markdown)}
          </div>
        </details>
      </div>
    </details>
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

function getRiskTooltip(risk: string) {
  if (risk === "Snapshot drift") {
    return "Historical reports may change when the same reporting period is rebuilt later.";
  }

  if (risk === "Missing snapshot coverage") {
    return "Entities or relationships may disappear from required reporting periods.";
  }

  if (risk === "Historical overlaps") {
    return "Multiple records may be valid for the same business key and time period.";
  }

  if (risk === "Historical gaps") {
    return "Required historical periods may have no valid record.";
  }

  if (risk === "Event-to-state mismatch") {
    return "Events may be attached to the wrong historical state or dimension version.";
  }

  if (risk === "Identity mismatch") {
    return "The same business entity may not be matched consistently across systems.";
  }

  if (risk === "Cross-system timeline drift") {
    return "Different systems may represent changes at different points in time.";
  }

  if (risk === "Missing dimension coverage") {
    return "Fact rows may not find a valid dimension row for the required reporting date.";
  }

  if (risk === "Duplicate events") {
    return "The same business event may be counted more than once.";
  }

  if (risk === "Incorrect event ordering") {
    return "Events may be interpreted in the wrong sequence.";
  }

  if (risk === "Lost correction history") {
    return "Historical corrections may overwrite previous states instead of preserving what was known at the time.";
  }

  if (risk === "Non-reproducible audit results") {
    return "Audit results may change when history is corrected or reloaded.";
  }

  if (risk === "Late arriving dimensions") {
    return "Dimension records may become available after facts or snapshots were already produced.";
  }

  if (risk === "Incorrect historical relationships") {
    return "Relationships may be assigned to the wrong historical period, causing incorrect rollups or ownership reporting.";
  }

  return "Review this risk during implementation and validation.";
}

function getValidationCheckTooltip(check: string) {
  if (check === "Snapshot reproducibility") {
    return "Verify that historical reports can be reproduced for the same reporting date.";
  }

  if (check === "One row per entity per snapshot") {
    return "Check that each entity appears only once for each snapshot date.";
  }

  if (check === "Snapshot completeness validation") {
    return "Check that all required entities are present for each reporting snapshot.";
  }

  if (check === "Late arriving dimension validation") {
    return "Check whether dimension records arrive after related facts or snapshots.";
  }

  if (check === "Overlap detection") {
    return "Detect records that are valid at the same time for the same business key.";
  }

  if (check === "Gap detection") {
    return "Detect missing historical periods where a record should exist.";
  }

  if (check === "Event sequencing") {
    return "Check that events are ordered correctly within each business entity.";
  }

  if (check === "Duplicate event detection") {
    return "Check whether the same business event appears more than once.";
  }

  if (check === "Event alignment validation") {
    return "Verify that each event maps to the correct historical state.";
  }

  if (check === "Visible-time validation") {
    return "Check that visible_from and visible_to correctly represent when records became known.";
  }

  if (check === "Historical correction validation") {
    return "Verify that corrected history preserves previous knowledge instead of overwriting it.";
  }

  if (check === "Identity resolution validation") {
    return "Check that the same business entity is matched consistently across systems.";
  }

  if (check === "Cross-system conformance") {
    return "Validate that timelines from different systems are aligned consistently.";
  }

  if (check === "Relationship history validation") {
    return "Check that changing relationships are valid for the reporting period.";
  }

  if (check === "Dimension coverage validation") {
    return "Verify that every fact row finds the correct dimension record for the reporting period.";
  }

  if (check === "Bitemporal reproducibility validation") {
    return "Verify that attributes can be reproduced as they were known at the reporting snapshot.";
  }

  return "Review this validation check during implementation.";
}

function renderMarkdownPreview(markdown: string) {
  return markdown.split("\n").map((line, index) => {
    if (line.startsWith("# ")) {
      return (
        <h1
          key={index}
          style={{
            fontSize: 24,
            margin: "0 0 18px",
            color: "#ffffff",
          }}
        >
          {line.replace("# ", "")}
        </h1>
      );
    }

    if (line.startsWith("## ")) {
      return (
        <h2
          key={index}
          style={{
            fontSize: 18,
            margin: "22px 0 8px",
            color: "#bfdbfe",
          }}
        >
          {line.replace("## ", "")}
        </h2>
      );
    }

    if (line.startsWith("### ")) {
      return (
        <h3
          key={index}
          style={{
            fontSize: 15,
            margin: "16px 0 6px",
            color: "#dbeafe",
          }}
        >
          {line.replace("### ", "")}
        </h3>
      );
    }

    if (line.startsWith("- ")) {
      return (
        <div
          key={index}
          style={{
            marginLeft: 14,
            color: "#cbd5e1",
          }}
        >
          • {line.replace("- ", "")}
        </div>
      );
    }

    if (!line.trim()) {
      return <div key={index} style={{ height: 8 }} />;
    }

    return (
      <p
        key={index}
        style={{
          margin: "0 0 6px",
          color: "#e2e8f0",
        }}
      >
        {line}
      </p>
    );
  });
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