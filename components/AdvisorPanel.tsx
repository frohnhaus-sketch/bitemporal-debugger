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
  const hasStartedAdvisor = useRef(false);
  const hasInteractedWithAdvisor = useRef(false);
  const hasTrackedAdvisorCompleted = useRef(false);
  const lastTrackedRecommendationKey = useRef<string | null>(null);

  useEffect(() => {
    if (hasTrackedAdvisorOpened.current) return;

    hasTrackedAdvisorOpened.current = true;

    track("advisor_viewed", {
      defaultReportingGoal: "SNAPSHOT",
      defaultSourceTypes: "",
      defaultHistoryCorrected: "YES",
      defaultMultipleSystems: "YES",
      defaultChangingRelationships: "YES",
      defaultHistorizedDimensions: "BITEMPORAL",
    });
  }, []);

  const [answers, setAnswers] = useState<AdvisorAnswers>({
    reportingGoal: "" as ReportingGoal,
    sourceTypes: [],
    historyCorrected: "" as YesNoUnknown,
    multipleSystems: "" as "YES" | "NO",
    changingRelationships: "" as "YES" | "NO",
    historizedDimensions: "" as DimensionNeed,
  });

  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [hasStartedAssessment, setHasStartedAssessment] = useState(false);

  const [advisorStep, setAdvisorStep] = useState(0);

  const [hasGeneratedRecommendation, setHasGeneratedRecommendation] =
    useState(false);

  const totalAdvisorSteps = 6;
  const answeredAdvisorSteps = [
    answers.reportingGoal,
    answers.sourceTypes.length > 0 ? "selected" : "",
    answers.historyCorrected,
    answers.multipleSystems,
    answers.changingRelationships,
    answers.historizedDimensions,
  ].filter(Boolean).length;

  const advisorProgress = Math.round(
    (answeredAdvisorSteps / totalAdvisorSteps) * 100,
  );
  const isLastAdvisorStep = advisorStep === totalAdvisorSteps - 1;

  const blueprint = useMemo(() => generateAdvisorBlueprint(answers), [answers]);

  const markdown = useMemo(
    () => generateAdvisorMarkdown(answers, blueprint),
    [answers, blueprint],
  );

  const advisorItems = useMemo(
    () => ({
      engineeringChallenges: blueprint.engineeringChallenges
        .map((name) => getAdvisorItem(name))
        .filter((item): item is AdvisorItem => item !== null),
      modelingPatterns: blueprint.modelingPatterns
        .map((name) => getAdvisorItem(name))
        .filter((item): item is AdvisorItem => item !== null),
      engineeringPatterns: blueprint.engineeringPatterns
        .map((name) => getAdvisorItem(name))
        .filter((item): item is AdvisorItem => item !== null),
    }),
    [
      blueprint.engineeringChallenges,
      blueprint.modelingPatterns,
      blueprint.engineeringPatterns,
    ],
  );

  function trackAdvisorStarted() {
    if (hasStartedAdvisor.current) return;

    hasStartedAdvisor.current = true;

    track("advisor_started", {
      source: "advisor_question_changed",
    });
  }

  function startAssessment() {
    setHasStartedAssessment(true);

    if (hasStartedAdvisor.current) return;

    hasStartedAdvisor.current = true;

    track("advisor_started", {
      source: "start_assessment_button",
    });
  }

  useEffect(() => {
    if (!hasInteractedWithAdvisor.current) return;

    const recommendationKey = JSON.stringify({
      reportingGoal: answers.reportingGoal,
      sourceTypes: answers.sourceTypes,
      historyCorrected: answers.historyCorrected,
      multipleSystems: answers.multipleSystems,
      changingRelationships: answers.changingRelationships,
      historizedDimensions: answers.historizedDimensions,
      recommendation: blueprint.recommendation,
    });

    if (lastTrackedRecommendationKey.current === recommendationKey) return;

    lastTrackedRecommendationKey.current = recommendationKey;

    track("advisor_recommendation_generated", {
      recommendation: blueprint.recommendation,
      reportingGoal: answers.reportingGoal,
      sourceTypes: answers.sourceTypes.join(","),
      historyCorrected: answers.historyCorrected,
      multipleSystems: answers.multipleSystems,
      changingRelationships: answers.changingRelationships,
      historizedDimensions: answers.historizedDimensions,
      challengeCount: advisorItems.engineeringChallenges.length,
      modelingPatternCount: advisorItems.modelingPatterns.length,
      engineeringPatternCount: advisorItems.engineeringPatterns.length,
      riskCount: blueprint.risks.length,
      validationCheckCount: blueprint.validationChecks.length,
    });
  }, [answers, blueprint]);

  const selectedSummary = [
    answers.reportingGoal ? getReportingGoalLabel(answers.reportingGoal) : null,
    ...answers.sourceTypes,
    answers.historizedDimensions && answers.historizedDimensions !== "NO"
      ? getDimensionLabel(answers.historizedDimensions)
      : null,
    answers.historyCorrected === "YES" ? "late or corrected history" : null,
    answers.multipleSystems === "YES" ? "multiple systems" : null,
    answers.changingRelationships === "YES"
      ? "time-dependent relationships"
      : null,
  ].filter(Boolean);

  const advisorSummaryChips = [
    answers.reportingGoal ? getReportingGoalLabel(answers.reportingGoal) : null,
    ...answers.sourceTypes,
    answers.historizedDimensions
      ? getDimensionLabel(answers.historizedDimensions)
      : null,
    answers.historyCorrected === "YES" ? "Corrected history" : null,
    answers.multipleSystems === "YES" ? "Multiple systems" : null,
    answers.changingRelationships === "YES" ? "Changing relationships" : null,
  ].filter(Boolean) as string[];

  function toggleSourceType(sourceType: SourceType) {
    trackAdvisorStarted();
    hasInteractedWithAdvisor.current = true;

    setHasGeneratedRecommendation(false);
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
    value: AdvisorAnswers[K],
  ) {
    trackAdvisorStarted();
    hasInteractedWithAdvisor.current = true;

    track("advisor_question_changed", {
      question,
      value: Array.isArray(value) ? value.join(",") : String(value),
    });

    setHasGeneratedRecommendation(false);
    setAnswers((prev) => ({
      ...prev,
      [question]: value,
    }));
  }

  async function copyMarkdownBlueprint() {
    if (!hasTrackedAdvisorCompleted.current) {
      hasTrackedAdvisorCompleted.current = true;

      track("advisor_completed", {
        reportingGoal: answers.reportingGoal,
        sourceTypes: answers.sourceTypes.join(","),
        historyCorrected: answers.historyCorrected,
        multipleSystems: answers.multipleSystems,
        changingRelationships: answers.changingRelationships,
        historizedDimensions: answers.historizedDimensions,
        source: "blueprint_copy",
      });
    }

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

  function goToPreviousAdvisorStep() {
    setAdvisorStep((step) => Math.max(0, step - 1));

    track("advisor_step_changed", {
      direction: "back",
      fromStep: advisorStep + 1,
      toStep: Math.max(0, advisorStep - 1) + 1,
    });
  }

  function goToNextAdvisorStep() {
    if (isLastAdvisorStep) {
      setHasGeneratedRecommendation(true);

      track("advisor_recommendation_requested", {
        step: advisorStep + 1,
        reportingGoal: answers.reportingGoal,
        sourceTypes: answers.sourceTypes.join(","),
        historyCorrected: answers.historyCorrected,
        multipleSystems: answers.multipleSystems,
        changingRelationships: answers.changingRelationships,
        historizedDimensions: answers.historizedDimensions,
        recommendation: blueprint.recommendation,
        challengeCount: advisorItems.engineeringChallenges.length,
        modelingPatternCount: advisorItems.modelingPatterns.length,
        engineeringPatternCount: advisorItems.engineeringPatterns.length,
      });

      return;
    }

    setAdvisorStep((step) => Math.min(totalAdvisorSteps - 1, step + 1));

    track("advisor_step_changed", {
      direction: "next",
      fromStep: advisorStep + 1,
      toStep: Math.min(totalAdvisorSteps - 1, advisorStep + 1) + 1,
    });
  }

  const canProceedAdvisorStep =
    (advisorStep === 0 && Boolean(answers.reportingGoal)) ||
    (advisorStep === 1 && answers.sourceTypes.length > 0) ||
    (advisorStep === 2 && Boolean(answers.historyCorrected)) ||
    (advisorStep === 3 && Boolean(answers.multipleSystems)) ||
    (advisorStep === 4 && Boolean(answers.changingRelationships)) ||
    (advisorStep === 5 && Boolean(answers.historizedDimensions));

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
        <SectionEyebrow>Historical Modeling Assessment</SectionEyebrow>

        <h2 style={{ margin: "0 0 8px", fontSize: 26 }}>
          Assess your historical modeling requirements
        </h2>

        <p style={{ color: "#475569", marginTop: 0, marginBottom: 0 }}>
          Answer a few questions and get a recommended historical modeling
          strategy.
        </p>
      </summary>
      {!hasStartedAssessment && (
        <div
          style={{
            marginTop: 24,
            padding: 22,
            borderRadius: 16,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <SectionEyebrow>Start Assessment</SectionEyebrow>

          <h3
            style={{
              margin: "0 0 10px",
              fontSize: 24,
              color: "#0f172a",
              letterSpacing: "-0.03em",
            }}
          >
            Answer 6 questions about your historical model.
          </h3>

          <p
            style={{
              margin: "0 0 16px",
              color: "#475569",
              fontSize: 15,
              lineHeight: 1.6,
              maxWidth: 760,
            }}
          >
            Get a recommended modeling strategy, relevant historical patterns,
            implementation risks and validation checks for your reporting model.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 10,
              marginBottom: 18,
            }}
          >
            {[
              "Takes less than 1 minute",
              "Recommends modeling patterns",
              "Highlights validation risks",
              "Generates an implementation blueprint",
            ].map((item) => (
              <div
                key={item}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "#ffffff",
                  border: "1px solid #dbeafe",
                  color: "#1e293b",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                ✓ {item}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={startAssessment}
            style={{
              border: "none",
              borderRadius: 12,
              padding: "12px 16px",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 900,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Start Assessment →
          </button>
        </div>
      )}
      {hasStartedAssessment && (
        <div
          style={{
            marginTop: 24,
            padding: 18,
            borderRadius: 16,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#2563eb",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                Question {advisorStep + 1} of {totalAdvisorSteps}
              </div>

              <div
                style={{
                  marginTop: 4,
                  color: "#64748b",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {advisorProgress}% complete
              </div>
            </div>

            <div
              style={{
                minWidth: 120,
                height: 8,
                borderRadius: 999,
                background: "#e2e8f0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${advisorProgress}%`,
                  height: "100%",
                  background: "#2563eb",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gap: 18 }}>
            {advisorStep === 0 && (
              <QuestionBlock
                title="What should the final reporting model support?"
                description="Choose the main reporting behavior the historical model needs to produce."
              >
                <select
                  value={answers.reportingGoal}
                  onChange={(e) =>
                    updateAnswer(
                      "reportingGoal",
                      e.target.value as ReportingGoal,
                    )
                  }
                  style={inputStyle}
                >
                  <option value="" disabled>
                    Select reporting behavior...
                  </option>
                  <option value="CURRENT_STATE">Only current state</option>
                  <option value="POINT_IN_TIME">Point-in-time reporting</option>
                  <option value="SNAPSHOT">Periodic snapshot reporting</option>
                  <option value="EVENT">Event-based reporting</option>
                  <option value="AUDIT">Audit / correction history</option>
                </select>
              </QuestionBlock>
            )}

            {advisorStep === 1 && (
              <QuestionBlock
                title="What kind of source data do you have?"
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
                          background: active ? "#2563eb" : "#ffffff",
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
            )}

            {advisorStep === 2 && (
              <QuestionBlock
                title="Can source history change after it was first loaded?"
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
                    updateAnswer(
                      "historyCorrected",
                      e.target.value as YesNoUnknown,
                    )
                  }
                  style={inputStyle}
                >
                  <option value="" disabled>
                    Select whether history can change...
                  </option>
                  <option value="YES">Yes, history can change later</option>
                  <option value="NO">No, history is stable once loaded</option>
                  <option value="UNKNOWN">Unknown / not sure</option>
                </select>
              </QuestionBlock>
            )}

            {advisorStep === 3 && (
              <QuestionBlock
                title="Does the final model combine multiple systems?"
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
                    updateAnswer(
                      "multipleSystems",
                      e.target.value as "YES" | "NO",
                    )
                  }
                  style={inputStyle}
                >
                  <option value="" disabled>
                    Select system scope...
                  </option>
                  <option value="YES">
                    Yes, multiple systems are combined
                  </option>
                  <option value="NO">No, mostly one source system</option>
                </select>
              </QuestionBlock>
            )}

            {advisorStep === 4 && (
              <QuestionBlock
                title="Can business relationships change over time?"
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
                    updateAnswer(
                      "changingRelationships",
                      e.target.value as "YES" | "NO",
                    )
                  }
                  style={inputStyle}
                >
                  <option value="" disabled>
                    Select relationship behavior...
                  </option>
                  <option value="YES">
                    Yes, relationships are time-dependent
                  </option>
                  <option value="NO">
                    No, relationships are mostly stable
                  </option>
                </select>
              </QuestionBlock>
            )}

            {advisorStep === 5 && (
              <QuestionBlock
                title="When looking at a report from last year, which attributes should be shown?"
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
                    updateAnswer(
                      "historizedDimensions",
                      e.target.value as DimensionNeed,
                    )
                  }
                  style={inputStyle}
                >
                  <option value="" disabled>
                    Select attribute behavior...
                  </option>
                  <option value="NO">
                    No descriptive attributes are needed
                  </option>
                  <option value="SCD1">
                    Always show today's attributes (SCD1)
                  </option>
                  <option value="SCD2">
                    Show attributes that were valid back then (SCD2)
                  </option>
                  <option value="BITEMPORAL">
                    Show attributes that were known back then (Bitemporal)
                  </option>
                </select>
              </QuestionBlock>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 18,
            }}
          >
            <button
              type="button"
              onClick={goToPreviousAdvisorStep}
              disabled={advisorStep === 0}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                background: advisorStep === 0 ? "#f1f5f9" : "#ffffff",
                color: advisorStep === 0 ? "#94a3b8" : "#0f172a",
                cursor: advisorStep === 0 ? "not-allowed" : "pointer",
                fontWeight: 800,
              }}
            >
              Back
            </button>

            <button
              type="button"
              onClick={canProceedAdvisorStep ? goToNextAdvisorStep : undefined}
              disabled={!canProceedAdvisorStep}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #1d4ed8",
                background: canProceedAdvisorStep ? "#2563eb" : "#cbd5e1",
                color: "#ffffff",
                cursor: canProceedAdvisorStep ? "pointer" : "not-allowed",
                fontWeight: 900,
              }}
            >
              {isLastAdvisorStep ? "Generate Recommendation" : "Next"}
            </button>
          </div>
        </div>
      )}
      {hasGeneratedRecommendation && (
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
              marginTop: 12,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {advisorSummaryChips.map((chip) => (
              <span
                key={chip}
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1d4ed8",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
          {blueprint.architecture.length > 0 && (
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
                Typical Architecture
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 8,
                }}
              >
                {blueprint.architecture.map((item, index) => (
                  <div key={item}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: 12,
                        borderRadius: 14,
                        background: "#ffffff",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 999,
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          fontSize: 12,
                          fontWeight: 900,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div
                          style={{
                            color: "#0f172a",
                            fontSize: 13,
                            fontWeight: 900,
                          }}
                        >
                          {item}
                        </div>

                        <div
                          style={{
                            marginTop: 3,
                            color: "#64748b",
                            fontSize: 12,
                            lineHeight: 1.4,
                          }}
                        >
                          {getArchitectureDescription(item)}
                        </div>
                      </div>
                    </div>

                    {index < blueprint.architecture.length - 1 && (
                      <div
                        style={{
                          marginLeft: 13,
                          height: 10,
                          borderLeft: "2px solid #bfdbfe",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <AdvisorRecommendationSection
            title="Engineering Challenges"
            description="What can go wrong in this historical model."
            items={advisorItems.engineeringChallenges}
            recommendation={blueprint.recommendation}
            eventName="advisor_challenge_opened"
            actionLabel="Open Challenge →"
            validationLabel="Open Validation →"
          />

          <AdvisorRecommendationSection
            title="Recommended Modeling Patterns"
            description="What the target historical model should look like."
            items={advisorItems.modelingPatterns}
            recommendation={blueprint.recommendation}
            eventName="advisor_modeling_pattern_clicked"
            actionLabel="Learn Pattern →"
            validationLabel="Open Validation →"
          />

          <AdvisorRecommendationSection
            title="Recommended Engineering Patterns"
            description="How to implement the required historical transformation."
            items={advisorItems.engineeringPatterns}
            recommendation={blueprint.recommendation}
            eventName="advisor_engineering_pattern_clicked"
            actionLabel="Learn Method →"
            validationLabel="Open Validation →"
          />
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
                Common Use Cases
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
                      Common problems solved
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {item.observedIn.map((evidence) => (
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
                These risks are derived from the selected reporting goal, source
                behavior and historical complexity. They highlight what can
                break during implementation.
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
                {blueprint.risks.length > 5 && (
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
                    +{blueprint.risks.length - 5} more
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
                These checks should be implemented before publishing the
                historical model or using it for reporting.
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
                : "Copy Implementation Blueprint"}
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
        </div>
      )}
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

type AdvisorItem = {
  name: string;
  href: string;
  category: "challenge" | "modeling" | "engineering";
};

function getAdvisorItem(name: string): AdvisorItem | null {
  const normalized = name.toLowerCase();

  if (
    normalized.includes("cdc history modeling") ||
    normalized.includes("reference data conformance") ||
    normalized.includes("scd1 dimension modeling")
  ) {
    return null;
  }

  if (name === "Historical Coverage Gap") {
    return {
      name,
      href: "/learn/historical-coverage-gap",
      category: "challenge",
    };
  }

  if (name === "Historical Overlap") {
    return {
      name,
      href: "/learn/historical-overlap",
      category: "challenge",
    };
  }

  if (name === "Historical Match Ambiguity") {
    return {
      name,
      href: "/learn/historical-match-ambiguity",
      category: "challenge",
    };
  }

  if (name === "Snapshot Reproducibility Risk") {
    return {
      name,
      href: "/learn/snapshot-reproducibility",
      category: "challenge",
    };
  }

  if (name === "Late Arriving Dimensions") {
    return {
      name,
      href: "/learn/dimension-completion",
      category: "challenge",
    };
  }

  if (name === "Event-to-State Mismatch") {
    return {
      name,
      href: "/learn/state-event-alignment",
      category: "challenge",
    };
  }

  if (name === "Cross-System Timeline Drift") {
    return {
      name,
      href: "/learn/historical-conformance",
      category: "challenge",
    };
  }

  if (name === "State Modeling") {
    return { name, href: "/learn/state-modeling", category: "modeling" };
  }

  if (name === "Event Modeling") {
    return { name, href: "/learn/event-modeling", category: "modeling" };
  }

  if (name === "Bitemporal Modeling") {
    return { name, href: "/learn/bitemporal-modeling", category: "modeling" };
  }

  if (name === "SCD2 vs Bitemporal Modeling") {
    return { name, href: "/learn/scd2-vs-bitemporal", category: "modeling" };
  }

  if (name === "State ↔ State Alignment") {
    return { name, href: "/learn/state-state-alignment", category: "modeling" };
  }

  if (name === "State ↔ Event Alignment") {
    return { name, href: "/learn/state-event-alignment", category: "modeling" };
  }

  if (name === "Historical Conformance") {
    return {
      name,
      href: "/learn/historical-conformance",
      category: "modeling",
    };
  }

  if (name === "Dimension Completion") {
    return { name, href: "/learn/dimension-completion", category: "modeling" };
  }

  if (name === "Relationship History") {
    return { name, href: "/learn/relationship-history", category: "modeling" };
  }

  if (name === "Identity Resolution") {
    return { name, href: "/learn/identity-resolution", category: "modeling" };
  }

  if (name === "Snapshot Fact Modeling") {
    return {
      name,
      href: "/learn/snapshot-fact-modeling",
      category: "modeling",
    };
  }

  if (name === "Snapshot Reproducibility") {
    return {
      name,
      href: "/learn/snapshot-reproducibility",
      category: "modeling",
    };
  }

  if (name === "As-Known Reporting") {
    return { name, href: "/learn/as-known-reporting", category: "modeling" };
  }

  if (name === "Historical Correction") {
    return { name, href: "/learn/historical-correction", category: "modeling" };
  }

  if (name === "Event Prioritization") {
    return {
      name,
      href: "/learn/event-prioritization",
      category: "engineering",
    };
  }

  if (name === "Event-to-State Projection") {
    return {
      name,
      href: "/learn/event-to-state-projection",
      category: "engineering",
    };
  }

  if (name === "State Reduction") {
    return { name, href: "/learn/state-reduction", category: "engineering" };
  }

  if (name === "Rectangle Decomposition") {
    return {
      name,
      href: "/learn/rectangle-decomposition",
      category: "engineering",
    };
  }

  if (name === "Historical Backfill") {
    return {
      name,
      href: "/learn/historical-backfill",
      category: "engineering",
    };
  }

  return null;
}

function AdvisorRecommendationSection({
  title,
  description,
  items,
  recommendation,
  eventName,
  actionLabel,
  validationLabel,
}: {
  title: string;
  description: string;
  items: AdvisorItem[];
  recommendation: string;
  eventName:
    | "advisor_challenge_opened"
    | "advisor_modeling_pattern_clicked"
    | "advisor_engineering_pattern_clicked";
  actionLabel: string;
  validationLabel: string;
}) {
  if (items.length === 0) return null;

  return (
    <div style={{ marginTop: 18 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#475569",
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </div>

      <p
        style={{
          margin: "0 0 10px",
          color: "#64748b",
          fontSize: 12,
          lineHeight: 1.45,
        }}
      >
        {description}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 12,
        }}
      >
        {items.slice(0, 6).map((item) => (
          <div
            key={`${item.category}-${item.name}`}
            style={{
              padding: 14,
              borderRadius: 16,
              background: "#ffffff",
              border: "1px solid #bfdbfe",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: "#0f172a",
                marginBottom: 6,
              }}
            >
              {item.name}
            </div>

            <div
              style={{
                color: "#475569",
                fontSize: 12,
                lineHeight: 1.45,
                marginBottom: 12,
              }}
            >
              {getAdvisorPatternDescription(item.name)}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <a
                href={item.href}
                onClick={() => {
                  track(eventName, {
                    pattern: item.name,
                    pattern_key: getAdvisorPatternKey(item.name),
                    category: item.category,
                    recommendation,
                    action: "learn",
                    source: "advisor_recommendation",
                  });

                  track("advisor_pattern_clicked", {
                    pattern: item.name,
                    pattern_key: getAdvisorPatternKey(item.name),
                    category: item.category,
                    recommendation,
                    action: "learn",
                    source: "advisor_recommendation",
                  });
                }}
                style={{
                  display: "inline-flex",
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: "#2563eb",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {actionLabel}
              </a>

              <a
                href="/#target-table-validation"
                onClick={() => {
                  track("advisor_validation_opened", {
                    pattern: item.name,
                    pattern_key: getAdvisorPatternKey(item.name),
                    category: item.category,
                    recommendation,
                    action: "open_validation",
                    source: "advisor_recommendation",
                  });
                }}
                style={{
                  display: "inline-flex",
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {validationLabel}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getArchitectureDescription(item: string) {
  if (item === "Historized Core Layer") {
    return "Preserves source history in a standardized historical structure.";
  }

  if (item === "Periodic Snapshot Fact Table") {
    return "Stores one reporting view per snapshot date for stable period reporting.";
  }

  if (item === "SCD2 Reporting Dimensions") {
    return "Provides attributes as they were valid at the reporting date.";
  }

  if (item === "Reporting Consumption Layer") {
    return "Exposes simplified tables for BI, analytics or downstream reporting.";
  }

  if (item === "Bitemporal model with correction visibility") {
    return "Tracks both business validity and when corrections became known.";
  }

  if (item === "Bitemporal dimension or reporting layer") {
    return "Supports as-known reporting and reproducible historical attributes.";
  }

  if (item === "Historized relationship bridge") {
    return "Represents changing relationships between entities over time.";
  }

  if (item === "Event-centric historical fact model") {
    return "Models business events as the primary analytical grain.";
  }

  if (item === "Bitemporal audit model") {
    return "Preserves previous and corrected versions for auditability.";
  }

  if (item === "Current-state curated table") {
    return "Keeps only the latest selected state per business entity.";
  }

  if (item === "Point-in-time historical query layer") {
    return "Allows reports to ask what was true at a selected historical date.";
  }

  if (item === "Fact table with SCD2 dimensions") {
    return "Joins facts to dimension versions by business-valid time.";
  }

  if (item === "Fact table with current dimensions") {
    return "Attaches latest descriptive attributes without preserving attribute history.";
  }

  return "Architecture component recommended for the selected historical modeling scenario.";
}

function getAdvisorPatternDescription(pattern: string) {
  if (pattern === "State Modeling") {
    return "Model source records as historical state intervals.";
  }

  if (pattern === "Event Modeling") {
    return "Represent business changes as point-in-time events.";
  }

  if (pattern === "State ↔ State Alignment") {
    return "Align independently historized state sources across valid-time intervals.";
  }

  if (pattern === "State ↔ Event Alignment") {
    return "Attach events to the state that was valid when the event occurred.";
  }

  if (pattern === "Relationship History") {
    return "Model changing relationships such as customer-advisor or policy-broker assignments.";
  }

  if (pattern === "Identity Resolution") {
    return "Resolve multiple identifiers that refer to the same business entity.";
  }

  if (pattern === "Historical Conformance") {
    return "Align competing histories from multiple source systems into one reporting view.";
  }

  if (pattern === "Historical Correction") {
    return "Preserve corrected history without losing what was known before.";
  }

  if (pattern === "Dimension Completion") {
    return "Ensure dimension history covers all required fact or snapshot periods.";
  }

  if (pattern === "Bitemporal Modeling") {
    return "Separate business-valid time from system-visible time.";
  }

  if (pattern === "Snapshot Reproducibility") {
    return "Make sure reports can be rebuilt for the same reporting date.";
  }

  if (pattern === "Event Prioritization") {
    return "Select business-relevant events from noisy operational event streams.";
  }

  if (pattern === "Historical Coverage Gap") {
    return "Missing historical coverage can cause facts, snapshots or dimensions to disappear from reports.";
  }

  if (pattern === "Historical Overlap") {
    return "Overlapping valid intervals can create ambiguous current state or duplicate report rows.";
  }

  if (pattern === "Historical Match Ambiguity") {
    return "Multiple valid matches can cause join explosions and inconsistent historical results.";
  }

  if (pattern === "Snapshot Reproducibility Risk") {
    return "Historical reports may change when the same reporting period is rebuilt later.";
  }

  if (pattern === "Late Arriving Dimensions") {
    return "Dimension records may become available after related facts or snapshots were already produced.";
  }

  if (pattern === "Event-to-State Projection") {
    return "Convert ordered events into valid state intervals for reporting and joins.";
  }

  if (pattern === "State Reduction") {
    return "Remove irrelevant historical state changes before exposing the reporting model.";
  }

  if (pattern === "Rectangle Decomposition") {
    return "Split independently changing histories into stable reporting intervals.";
  }

  if (pattern === "Historical Backfill") {
    return "Rebuild or reconstruct historical records after data already exists.";
  }

  if (pattern === "Snapshot Fact Modeling") {
    return "Create stable periodic fact rows for reporting dates such as month-end.";
  }

  if (pattern === "As-Known Reporting") {
    return "Report using only the information that was visible at the historical reporting time.";
  }

  if (pattern === "Event-to-State Mismatch") {
    return "Events may be attached to the wrong historical state or dimension version.";
  }

  if (pattern === "Cross-System Timeline Drift") {
    return "Different systems may represent the same business change on different timelines.";
  }
  return "Review this pattern before implementing the historical model.";
}

function getAdvisorPatternKey(pattern: string) {
  return pattern
    .toLowerCase()
    .replaceAll(" ↔ ", "_")
    .replaceAll(" / ", "_")
    .replaceAll(" ", "_")
    .replaceAll("-", "_");
}

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
