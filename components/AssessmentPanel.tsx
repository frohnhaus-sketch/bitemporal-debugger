import type { CSSProperties, RefObject } from "react";
import type { SourcePatternResult } from "@/lib/sourcePatterns";
import { ValidationContextPanel } from "@/components/ValidationContextPanel";
import { track } from "@/lib/analytics";

type Props = {
  sourcePatterns: {
    sourceA: SourcePatternResult | null;
    sourceB: SourcePatternResult | null;
  };
  relationshipAnalysis: any;
  relationshipComplexityStyle: any;
  historicalPatterns: any[];
  isMobile: boolean;
  analysisRef: RefObject<HTMLDivElement | null>;
  validationContextRef: RefObject<HTMLDivElement | null>;
  guidedDemoStep: number | null;
  asOfDate: string;
  visibleAsOf: string;
  setAsOfDate: (value: string) => void;
  setVisibleAsOf: (value: string) => void;
  resetDates: () => void;
};

type LearnPattern = {
  label: string;
  key: string;
  href: string;
  description: string;
};

const LEARN_PATTERNS: Record<string, LearnPattern> = {
  as_known_reporting: {
    label: "As-Known Reporting",
    key: "as_known_reporting",
    href: "/learn/as-known-reporting",
    description:
      "Use only the information that was known at the reporting time.",
  },
  bitemporal_modeling: {
    label: "Bitemporal Modeling",
    key: "bitemporal_modeling",
    href: "/learn/bitemporal-modeling",
    description:
      "Separate business-valid time from system-visible time.",
  },
  dimension_completion: {
    label: "Dimension Completion",
    key: "dimension_completion",
    href: "/learn/dimension-completion",
    description:
      "Complete missing dimension history before joining to facts.",
  },
  historical_backfill: {
    label: "Historical Backfill",
    key: "historical_backfill",
    href: "/learn/historical-backfill",
    description:
      "Reconstruct missing historical state, events or snapshots.",
  },
  historical_conformance: {
    label: "Historical Conformance",
    key: "historical_conformance",
    href: "/learn/historical-conformance",
    description:
      "Align multiple historical source timelines into one reporting history.",
  },
  historical_correction: {
    label: "Historical Correction",
    key: "historical_correction",
    href: "/learn/historical-correction",
    description:
      "Preserve corrected history without losing previous knowledge states.",
  },
  historical_coverage_gap: {
    label: "Historical Coverage Gap",
    key: "historical_coverage_gap",
    href: "/learn/historical-coverage-gap",
    description:
      "A required historical period has no valid matching record.",
  },
  historical_match_ambiguity: {
    label: "Historical Match Ambiguity",
    key: "historical_match_ambiguity",
    href: "/learn/historical-match-ambiguity",
    description:
      "A temporal join produces multiple valid matches.",
  },
  historical_overlap: {
    label: "Historical Overlap",
    key: "historical_overlap",
    href: "/learn/historical-overlap",
    description:
      "Multiple records are valid for the same entity at the same time.",
  },
  snapshot_reproducibility: {
    label: "Snapshot Reproducibility",
    key: "snapshot_reproducibility",
    href: "/learn/snapshot-reproducibility",
    description:
      "Ensure historical reports can be rebuilt with the same result.",
  },
  state_event_alignment: {
    label: "State ↔ Event Alignment",
    key: "state_event_alignment",
    href: "/learn/state-event-alignment",
    description:
      "Connect events to the state that was valid when they occurred.",
  },
  state_state_alignment: {
    label: "State ↔ State Alignment",
    key: "state_state_alignment",
    href: "/learn/state-state-alignment",
    description:
      "Join two historized state sources across overlapping intervals.",
  },
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

  const primaryPattern = getPrimaryPattern(relationshipAnalysis);
  const relatedPatterns = getRelatedPatterns(
    relationshipAnalysis,
    historicalPatterns
  );

  const detectedSources = [
    sourcePatterns.sourceA,
    sourcePatterns.sourceB,
  ] as SourcePatternResult[];

  return (
    <>
      <details open style={assessmentShellStyle}>
        <summary style={summaryStyle}>Historical Modeling Assessment</summary>

        <div style={assessmentBodyStyle}>
          <section style={primaryPatternStyle}>
            <div style={primaryIconStyle}>↔</div>

            <div style={{ minWidth: 0 }}>
              <Eyebrow>Primary Historical Pattern</Eyebrow>

              <h2 style={primaryTitleStyle}>{primaryPattern.label}</h2>

              <p style={primaryTextStyle}>{primaryPattern.description}</p>

              {relationshipAnalysis?.relationship && (
                <div style={detectedRelationshipStyle}>
                  Detected relationship:{" "}
                  <strong>{relationshipAnalysis.relationship}</strong>
                </div>
              )}

              <a
                href={primaryPattern.href}
                onClick={() => {
                  track("related_pattern_clicked", {
                    from: "assessment_primary_pattern",
                    to: primaryPattern.key,
                  });
                }}
                style={primaryButtonStyle}
              >
                Learn Pattern →
              </a>
            </div>

            {relationshipComplexityStyle && (
              <div
                style={{
                  ...riskBadgeStyle,
                  background: relationshipComplexityStyle.background,
                  border: `1px solid ${relationshipComplexityStyle.border}`,
                  color: relationshipComplexityStyle.color,
                }}
              >
                {relationshipComplexityStyle.label}
              </div>
            )}
          </section>

          {relatedPatterns.length > 0 && (
            <section style={sectionCardStyle}>
              <Eyebrow>Related Patterns</Eyebrow>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: 12,
                }}
              >
                {relatedPatterns.map((pattern) => (
                  <a
                    key={pattern.key}
                    href={pattern.href}
                    onClick={() => {
                      track("related_pattern_clicked", {
                        from: "assessment_related_patterns",
                        to: pattern.key,
                      });
                    }}
                    style={relatedPatternCardStyle}
                  >
                    <span>
                      <span style={relatedPatternTitleStyle}>
                        {pattern.label}
                      </span>
                      <span style={relatedPatternTextStyle}>
                        {pattern.description}
                      </span>
                    </span>

                    <span style={relatedArrowStyle}>›</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          <section style={sectionCardStyle}>
            <Eyebrow>Expected Modeling Challenges</Eyebrow>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 10,
              }}
            >
              {(relationshipAnalysis?.challenges ?? []).map(
                (challenge: string) => (
                  <div key={challenge} style={challengeCardStyle}>
                    <div style={challengeIconStyle}>?</div>
                    <div style={challengeTextStyle}>{challenge}</div>
                  </div>
                )
              )}
            </div>
          </section>

          {historicalPatterns.length > 0 && (
            <section style={sectionCardStyle}>
              <Eyebrow>Validation Findings</Eyebrow>

              <p style={validationIntroStyle}>
                Investigate the findings below to understand the root cause and
                historical impact.
              </p>

              <div style={{ display: "grid", gap: 10 }}>
                {historicalPatterns.map((pattern: any) => {
                  const severity = getFindingSeverity(pattern.name);
                  const mappedPattern = getPatternForFinding(pattern.name);

                  return (
                    <div
                      key={pattern.name}
                      style={{
                        ...findingCardStyle,
                        borderLeft: `4px solid ${severity.border}`,
                        background: severity.background,
                        borderColor: severity.softBorder,
                      }}
                      onClick={() => {
                        analysisRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                    >
                      <div style={findingIconStyle}>{severity.icon}</div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            ...findingTitleStyle,
                            color: severity.color,
                          }}
                        >
                          {pattern.name}
                        </div>

                        <div style={findingEvidenceStyle}>
                          {(pattern.evidence ?? []).map((item: string) => (
                            <span key={item}>• {item}</span>
                          ))}
                        </div>

                        <p style={findingDescriptionStyle}>
                          {pattern.description}
                        </p>

                        <a
                          href={mappedPattern.href}
                          onClick={(event) => {
                            event.stopPropagation();

                            track("related_pattern_clicked", {
                              from: "assessment_validation_finding",
                              to: mappedPattern.key,
                            });
                          }}
                          style={findingLearnLinkStyle}
                        >
                          Learn: {mappedPattern.label} →
                        </a>
                      </div>

                      <div style={findingArrowStyle}>›</div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <details style={sourceDetailsStyle}>
          <summary style={sourceSummaryStyle}>Source Characteristics</summary>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 16,
              marginTop: 16,
            }}
          >
            {detectedSources.map((pattern, index) => (
              <div key={index} style={sourceCardStyle}>
                <div style={sourceLabelStyle}>
                  {index === 0 ? "Source A" : "Source B"}
                </div>

                <Eyebrow>Detected Source Pattern</Eyebrow>

                <div style={sourcePatternTitleStyle}>
                  {pattern.label.replace("Likely ", "")}
                </div>

                <Eyebrow>Indicators</Eyebrow>

                <div style={indicatorListStyle}>
                  {pattern.indicators.map((indicator: string) => (
                    <div key={indicator} style={indicatorRowStyle}>
                      <span style={indicatorCheckStyle}>✓</span>
                      <span>{indicator}</span>
                    </div>
                  ))}
                </div>

                <div style={validationNoteStyle}>
                  <Eyebrow>Validation Notes</Eyebrow>

                  <div style={validationNoteTextStyle}>
                    {pattern.modelingInsight}
                  </div>
                </div>
              </div>
            ))}
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
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div style={eyebrowStyle}>{children}</div>;
}

function getPrimaryPattern(relationshipAnalysis: any): LearnPattern {
  const relationship = String(relationshipAnalysis?.relationship ?? "")
    .toLowerCase()
    .trim();

  const recommendation = String(relationshipAnalysis?.recommendation ?? "")
    .toLowerCase()
    .trim();

  if (
    relationship.includes("retroactive") ||
    recommendation.includes("visible time") ||
    recommendation.includes("corrected knowledge")
  ) {
    return LEARN_PATTERNS.as_known_reporting;
  }

  if (relationship.includes("state") && relationship.includes("event")) {
    return LEARN_PATTERNS.state_event_alignment;
  }

  if (relationship.includes("state")) {
    return LEARN_PATTERNS.state_state_alignment;
  }

  return LEARN_PATTERNS.historical_conformance;
}

function getRelatedPatterns(
  relationshipAnalysis: any,
  historicalPatterns: any[]
): LearnPattern[] {
  const patterns = new Map<string, LearnPattern>();

  historicalPatterns.forEach((finding) => {
    const pattern = getPatternForFinding(finding.name);
    patterns.set(pattern.key, pattern);
  });

  const challenges = relationshipAnalysis?.challenges ?? [];

  challenges.forEach((challenge: string) => {
    const normalized = challenge.toLowerCase();

    if (normalized.includes("snapshot")) {
      patterns.set(
        LEARN_PATTERNS.snapshot_reproducibility.key,
        LEARN_PATTERNS.snapshot_reproducibility
      );
    }

    if (normalized.includes("late")) {
      patterns.set(
        LEARN_PATTERNS.dimension_completion.key,
        LEARN_PATTERNS.dimension_completion
      );
    }

    if (normalized.includes("visible")) {
      patterns.set(
        LEARN_PATTERNS.bitemporal_modeling.key,
        LEARN_PATTERNS.bitemporal_modeling
      );
    }

    if (normalized.includes("correction")) {
      patterns.set(
        LEARN_PATTERNS.historical_correction.key,
        LEARN_PATTERNS.historical_correction
      );
    }
  });

  return Array.from(patterns.values()).slice(0, 6);
}

function getPatternForFinding(name: string): LearnPattern {
  const normalized = name.toLowerCase();

  if (normalized.includes("ambiguous") || normalized.includes("ambiguity")) {
    return LEARN_PATTERNS.historical_match_ambiguity;
  }

  if (normalized.includes("late arriving")) {
    return LEARN_PATTERNS.dimension_completion;
  }

  if (normalized.includes("gap")) {
    return LEARN_PATTERNS.historical_coverage_gap;
  }

  if (normalized.includes("overlap")) {
    return LEARN_PATTERNS.historical_overlap;
  }

  if (normalized.includes("state") && normalized.includes("event")) {
    return LEARN_PATTERNS.state_event_alignment;
  }

  return LEARN_PATTERNS.state_state_alignment;
}

function getFindingSeverity(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.startsWith("possible")) {
    return {
      icon: "!",
      background: "#fffbeb",
      softBorder: "#fde68a",
      border: "#f59e0b",
      color: "#92400e",
    };
  }

  if (normalized.includes("ambiguity") || normalized.includes("overlap")) {
    return {
      icon: "!",
      background: "#fef2f2",
      softBorder: "#fecaca",
      border: "#ef4444",
      color: "#b91c1c",
    };
  }

  return {
    icon: "!",
    background: "#fff7ed",
    softBorder: "#fed7aa",
    border: "#f97316",
    color: "#9a3412",
  };
}

const assessmentShellStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "#ffffff",
  border: "1px solid #dbeafe",
  borderRadius: 18,
  padding: 16,
  marginTop: 18,
  marginBottom: 18,
  boxShadow: "0 18px 48px rgba(15, 23, 42, 0.18)",
};

const summaryStyle: CSSProperties = {
  cursor: "pointer",
  fontSize: 20,
  fontWeight: 900,
  color: "#0f172a",
  marginBottom: 14,
};

const assessmentBodyStyle: CSSProperties = {
  display: "grid",
  gap: 16,
};

const primaryPatternStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "72px 1fr auto",
  gap: 18,
  alignItems: "center",
  padding: 24,
  borderRadius: 18,
  background: "linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)",
  border: "1px solid #bfdbfe",
};

const primaryIconStyle: CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: 30,
  fontWeight: 900,
};

const primaryTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 8,
  fontSize: 30,
  lineHeight: 1.08,
  letterSpacing: "-0.04em",
  color: "#0f172a",
};

const primaryTextStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 10,
  maxWidth: 760,
  color: "#475569",
  fontSize: 15,
  lineHeight: 1.6,
};

const detectedRelationshipStyle: CSSProperties = {
  marginBottom: 14,
  color: "#64748b",
  fontSize: 13,
  lineHeight: 1.5,
};

const primaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  padding: "10px 13px",
  borderRadius: 12,
  background: "#ffffff",
  border: "1px solid #93c5fd",
  color: "#1d4ed8",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 900,
};

const riskBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "7px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const sectionCardStyle: CSSProperties = {
  padding: 22,
  borderRadius: 18,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
};

const eyebrowStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: 0.7,
  color: "#2563eb",
  marginBottom: 10,
};

const relatedPatternCardStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: 14,
  borderRadius: 14,
  background: "#f8fafc",
  border: "1px solid #dbeafe",
  color: "#0f172a",
  textDecoration: "none",
};

const relatedPatternTitleStyle: CSSProperties = {
  display: "block",
  color: "#1d4ed8",
  fontSize: 14,
  fontWeight: 900,
  marginBottom: 5,
};

const relatedPatternTextStyle: CSSProperties = {
  display: "block",
  color: "#64748b",
  fontSize: 12,
  lineHeight: 1.45,
};

const relatedArrowStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 24,
  fontWeight: 900,
};

const challengeCardStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: 14,
  borderRadius: 14,
  background: "#fff7ed",
  border: "1px solid #fed7aa",
};

const challengeIconStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#ffedd5",
  color: "#c2410c",
  fontSize: 18,
  fontWeight: 900,
  flexShrink: 0,
};

const challengeTextStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: 13,
  fontWeight: 900,
  lineHeight: 1.35,
};

const validationIntroStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  color: "#64748b",
  fontSize: 13,
  lineHeight: 1.5,
};

const findingCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "42px 1fr auto",
  gap: 12,
  alignItems: "center",
  border: "1px solid",
  borderRadius: 14,
  padding: 14,
  cursor: "pointer",
};

const findingIconStyle: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,0.7)",
  fontWeight: 900,
};

const findingTitleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 900,
  marginBottom: 6,
};

const findingEvidenceStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 7,
  color: "#64748b",
  fontSize: 12,
  fontWeight: 800,
};

const findingDescriptionStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 8,
  color: "#334155",
  fontSize: 13,
  lineHeight: 1.45,
};

const findingLearnLinkStyle: CSSProperties = {
  color: "#1d4ed8",
  fontSize: 12,
  fontWeight: 900,
  textDecoration: "none",
};

const findingArrowStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 28,
  fontWeight: 700,
};

const sourceDetailsStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 16,
  color: "#0f172a",
  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  marginTop: 12,
};

const sourceSummaryStyle: CSSProperties = {
  cursor: "pointer",
  fontSize: 17,
  fontWeight: 900,
  color: "#0f172a",
};

const sourceCardStyle: CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 16,
  background: "#f8fafc",
  minWidth: 0,
  boxSizing: "border-box",
};

const sourceLabelStyle: CSSProperties = {
  fontSize: 13,
  color: "#64748b",
  marginBottom: 8,
};

const sourcePatternTitleStyle: CSSProperties = {
  fontSize: 24,
  fontWeight: 900,
  color: "#0f172a",
  marginBottom: 16,
};

const indicatorListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  marginBottom: 16,
};

const indicatorRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  color: "#334155",
};

const indicatorCheckStyle: CSSProperties = {
  color: "#16a34a",
  fontWeight: 900,
};

const validationNoteStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 14,
};

const validationNoteTextStyle: CSSProperties = {
  color: "#334155",
  lineHeight: 1.5,
};