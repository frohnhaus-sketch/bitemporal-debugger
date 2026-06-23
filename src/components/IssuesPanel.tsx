import type { AggregatedJoinabilityIssue, TemporalIssue } from "@/lib/types";
import { track } from "@/lib/analytics";
import { useEffect, useState } from "react";

type IssuesPanelProps = {
  initialFilter?: "ALL" | "JOIN_GAP" | "JOIN_AMBIGUITY" | "OVERLAP" | "VALID_GAP";
  joinIssues: AggregatedJoinabilityIssue[];
  selectedIssue: AggregatedJoinabilityIssue | null;
  setSelectedIssue: (j: AggregatedJoinabilityIssue | null) => void;
  temporalIssues: TemporalIssue[];
  selectedTemporalIssue: TemporalIssue | null;
  onSelectTemporalIssue: (issue: TemporalIssue | null) => void;
  hasAnalyzed: boolean;
  showIssueDetails: boolean;
};

type IssueFilter =
  | "ALL"
  | "JOIN_GAP"
  | "JOIN_AMBIGUITY"
  | "VALID_GAP"
  | "OVERLAP"
  | "VISIBILITY_LAG"
  | "SNAPSHOT_DRIFT"
  | "DIMENSION_COMPLETION_RISK";
type FindingSeverity = "high" | "medium" | "low";

type KpiItem = {
  label: string;
  value: number;
  filter: IssueFilter;
  icon: string;
  color: string;
  background: string;
};

function getFindingSeverity(type: string): FindingSeverity {
  if (type === "OVERLAP") return "high";
  if (type === "JOIN_AMBIGUITY") return "high";

  if (type === "JOIN_GAP") return "medium";
  if (type === "VALID_GAP") return "medium";

  if (type === "VISIBILITY_LAG") return "low";

  return "medium";
}

function getFindingPriority(type: string) {
  const severity = getFindingSeverity(type);

  if (severity === "high") return 1;
  if (severity === "medium") return 2;
  return 3;
}

function getFindingLabel(type: string) {
  if (type === "JOIN_GAP") return "Missing Match";
  if (type === "VALID_GAP") return "Missing Coverage";
  if (type === "JOIN_AMBIGUITY") return "Ambiguous Match";
  if (type === "VISIBILITY_LAG") return "Visibility Lag";
  if (type === "OVERLAP") return "Overlapping Historization";
  if (type === "DIMENSION_COMPLETION_RISK") return "Dimension Completion Risk";

  return type;
}

function formatJoinReason(reason: string) {
  if (reason === "NO_VISIBLE_OVERLAP") return "No visible-time overlap";
  if (reason === "NO_VALID_MATCH") return "No valid-time match";
  if (reason === "MULTIPLE_MATCHES") return "Multiple matches";
  return reason;
}

function getTemporalIssueAccent(type: TemporalIssue["type"]) {
  if (type === "OVERLAP") {
    return {
      border: "#ef4444",
      background: "#fff7f7",
      color: "#b91c1c",
      icon: "!",
    };
  }

  if (type === "JOIN_AMBIGUITY") {
    return {
      border: "#2563eb",
      background: "#eff6ff",
      color: "#1d4ed8",
      icon: "=",
    };
  }

  if (type === "JOIN_GAP") {
    return {
      border: "#f59e0b",
      background: "#fffaf0",
      color: "#92400e",
      icon: "−",
    };
  }

  if (type === "VALID_GAP") {
    return {
      border: "#92400e",
      background: "#fffbeb",
      color: "#92400e",
      icon: "?",
    };
  }

  if (type === "VISIBILITY_LAG") {
    return {
      border: "#8b5cf6",
      background: "#faf5ff",
      color: "#6d28d9",
      icon: "◷",
    };
  }

  if (type === "SNAPSHOT_DRIFT") {
    return {
      border: "#0f766e",
      background: "#f0fdfa",
      color: "#0f766e",
      icon: "↔",
    };
  }

  if (type === "DIMENSION_COMPLETION_RISK") {
    return {
      border: "#be123c",
      background: "#fff1f2",
      color: "#9f1239",
      icon: "◧",
    };
  }

  return {
    border: "#64748b",
    background: "#f8fafc",
    color: "#475569",
    icon: "•",
  };
}

export function IssuesPanel({
  initialFilter,
  joinIssues,
  selectedIssue,
  setSelectedIssue,
  temporalIssues,
  selectedTemporalIssue,
  onSelectTemporalIssue,
  hasAnalyzed,
  showIssueDetails,
}: IssuesPanelProps) {

  function mapInitialFilter(
    filter?: IssuesPanelProps["initialFilter"]
  ): IssueFilter {
    if (filter === "JOIN_GAP") return "JOIN_GAP";
    if (filter === "JOIN_AMBIGUITY") return "JOIN_AMBIGUITY";
    if (filter === "VALID_GAP") return "VALID_GAP";
    if (filter === "OVERLAP") return "OVERLAP";

    return "ALL";
  }

  const [activeIssueFilter, setActiveIssueFilter] =
    useState<IssueFilter>(
      mapInitialFilter(initialFilter)
    );

  useEffect(() => {
    if (!initialFilter || initialFilter === "ALL") return;

    setActiveIssueFilter(mapInitialFilter(initialFilter));
  }, [initialFilter]);

  const gapIssues = temporalIssues.filter((i) => i.type === "VALID_GAP");
  const overlapIssues = temporalIssues.filter((i) => i.type === "OVERLAP");
  const visibilityLagIssues= temporalIssues.filter(
    (i) => i.type === "VISIBILITY_LAG"
  );

  const dimensionCompletionIssues = temporalIssues.filter(
    (i) => i.type === "DIMENSION_COMPLETION_RISK"
  );

  const snapshotDriftIssues = temporalIssues.filter(
    (i) => i.type === "SNAPSHOT_DRIFT"
  );

  const MAX_VISIBLE_JOIN_ISSUES = 50;
  const visibleJoinIssues = joinIssues.slice(0, MAX_VISIBLE_JOIN_ISSUES);

  const hasFindings =
    joinIssues.length > 0 ||
    gapIssues.length > 0 ||
    overlapIssues.length > 0 ||
    visibilityLagIssues.length > 0 ||
    snapshotDriftIssues.length > 0 || dimensionCompletionIssues.length > 0;
  const filteredJoinIssues =
    activeIssueFilter === "ALL"
      ? visibleJoinIssues
      : activeIssueFilter === "JOIN_GAP" ||
        activeIssueFilter === "JOIN_AMBIGUITY"
      ? visibleJoinIssues.filter((i) => i.type === activeIssueFilter)
      : [];

  const filteredGapIssues =
    activeIssueFilter === "VALID_GAP" || activeIssueFilter === "ALL"
      ? gapIssues
      : [];

  const filteredOverlapIssues =
    activeIssueFilter === "OVERLAP" || activeIssueFilter === "ALL"
      ? overlapIssues
      : [];

  const filteredVisibilityLagIssues =
    activeIssueFilter === "VISIBILITY_LAG" || activeIssueFilter === "ALL"
      ? visibilityLagIssues
      : [];

  const filteredDimensionCompletionIssues =
    activeIssueFilter === "DIMENSION_COMPLETION_RISK" ||
    activeIssueFilter === "ALL"
      ? dimensionCompletionIssues
      : [];

  const filteredSnapshotDriftIssues =
    activeIssueFilter === "SNAPSHOT_DRIFT" || activeIssueFilter === "ALL"
      ? snapshotDriftIssues
      : [];

  const hasHighRisk = temporalIssues.some((issue) =>
    ["OVERLAP", "JOIN_AMBIGUITY"].includes(issue.type)
  );

  const hasMediumRisk = temporalIssues.some((issue) =>
    ["JOIN_GAP", "VALID_GAP"].includes(issue.type)
  );

  const validationRisk = hasHighRisk
    ? "High"
    : hasMediumRisk
    ? "Medium"
    : "Low";

  const kpis: KpiItem[] = [
    {
      label: "Overlaps",
      value: overlapIssues.length,
      filter: "OVERLAP",
      icon: "!",
      color: "#dc2626",
      background: "#fef2f2",
    },
    {
      label: "Ambiguous Matches",
      value: joinIssues.filter((i) => i.type === "JOIN_AMBIGUITY").length,
      filter: "JOIN_AMBIGUITY" as IssueFilter,
      icon: "=",
      color: "#2563eb",
      background: "#eff6ff",
    },
    ...(snapshotDriftIssues.length > 0
      ? [
          {
            label: "Snapshot Drift",
            value: snapshotDriftIssues.length,
            filter: "SNAPSHOT_DRIFT" as IssueFilter,
            icon: "↔",
            color: "#0f766e",
            background: "#f0fdfa",
          }
        ]
      : []),
    {
      label: "Missing Matches",
      value: joinIssues.filter((i) => i.type === "JOIN_GAP").length,
      filter: "JOIN_GAP",
      icon: "−",
      color: "#f59e0b",
      background: "#fffaf0",
    },
    {
      label: "Missing Coverage",
      value: gapIssues.length,
      filter: "VALID_GAP",
      icon: "?",
      color: "#92400e",
      background: "#fffbeb",
    },
    {
      label: "Visibility Lag",
      value: visibilityLagIssues.length,
      filter: "VISIBILITY_LAG",
      icon: "◷",
      color: "#7c3aed",
      background: "#faf5ff",
    },
    {
      label: "Dimension Completion",
      value: dimensionCompletionIssues.length,
      filter: "DIMENSION_COMPLETION_RISK",
      icon: "◧",
      color: "#be123c",
      background: "#fff1f2",
    },
  ];

  const shouldShowDetails = showIssueDetails || activeIssueFilter !== "ALL";

  function renderJoinIssue(issue: AggregatedJoinabilityIssue, index: number) {
    const isSelected = selectedIssue === issue;
    const isAmbiguity = issue.type === "JOIN_AMBIGUITY";

    const accentColor = isAmbiguity ? "#2563eb" : "#f59e0b";
    const textColor = isAmbiguity ? "#1d4ed8" : "#92400e";
    const background = isAmbiguity ? "#eff6ff" : "#fffaf0";

    return (
      <button
        key={index}
        onClick={() => {
          track("issue_selected", {
            type: issue.type,
            reason: issue.reason,
            aggregated: Boolean(issue.isAggregated),
          });

          setSelectedIssue(isSelected ? null : issue);
        }}
        style={{
          width: "100%",
          minHeight: 58,
          textAlign: "left",
          cursor: "pointer",
          padding: "12px 14px",
          marginBottom: 8,
          borderRadius: 8,
          background,
          border: isSelected
            ? "2px solid #2563eb"
            : `1px solid ${accentColor}`,
          boxShadow: isSelected
            ? "0 0 0 2px rgba(37,99,235,0.14)"
            : "none",
          color: "#0f172a",
          fontFamily: "inherit",
          fontSize: 13,
          lineHeight: 1.35,
          transition: "all 0.15s ease",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(120px, 180px) minmax(220px, 1fr) minmax(180px, 240px) minmax(200px, 1fr) minmax(90px, 120px)",
            alignItems: "center",
            gap: 16,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                background: accentColor,
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                flexShrink: 0,
                fontSize: 15,
              }}
            >
              {isAmbiguity ? "=" : "−"}
            </span>

            <strong
              style={{
                color: textColor,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {getFindingLabel(issue.type)}
            </strong>
          </div>

          <div
            style={{
              color: "#475569",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {issue.source} → {issue.targetSource}
            {issue.isAggregated
              ? ` · ${issue.count} entities`
              : ` · Entity ${issue.entity_id}`}
          </div>

          <div
            style={{
              color: "#64748b",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {issue.valid_from} → {issue.valid_to}
          </div>

          <div
            style={{
              color: "#64748b",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Reason: {formatJoinReason(issue.reason)}
          </div>

          <div
            style={{
              color: textColor,
              textAlign: "right",
              fontWeight: 700,
              opacity: 0.8,
              whiteSpace: "nowrap",
            }}
          >
            investigate →
          </div>
        </div>
      </button>
    );
  }

  function renderTemporalIssue(issue: TemporalIssue) {
    const isSelected = selectedTemporalIssue?.id === issue.id;
    const accent = getTemporalIssueAccent(issue.type);

    return (
      <button
        key={issue.id}
        onClick={() => {
          track("temporal_issue_selected", {
            type: issue.type,
            severity: issue.severity,
            source: issue.source,
          });

          onSelectTemporalIssue(isSelected ? null : issue);
        }}
        style={{
          width: "100%",
          minHeight: 58,
          textAlign: "left",
          cursor: "pointer",
          padding: "12px 14px",
          marginBottom: 8,
          borderRadius: 8,
          background: accent.background,
          border: isSelected
            ? "2px solid #2563eb"
            : `1px solid ${accent.border}`,
          boxShadow: isSelected
            ? "0 0 0 2px rgba(37,99,235,0.14)"
            : "none",
          color: "#0f172a",
          fontFamily: "inherit",
          fontSize: 13,
          lineHeight: 1.35,
          transition: "all 0.15s ease",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(160px, 220px) minmax(160px, 1fr) minmax(180px, 240px) minmax(240px, 1fr) minmax(90px, 120px)",
            alignItems: "center",
            gap: 16,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                background: accent.border,
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                flexShrink: 0,
                fontSize: 14,
              }}
            >
              {accent.icon}
            </span>

            <strong
              style={{
                color: accent.color,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {issue.title}
            </strong>
          </div>

          <div
            style={{
              color: "#475569",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Entity {issue.entity_id}
            {issue.source ? ` · ${issue.source}` : ""}
          </div>

          <div
            style={{
              color: "#64748b",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {issue.from && issue.to ? `${issue.from} → ${issue.to}` : "n/a"}
          </div>

          <div
            style={{
              color: "#64748b",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {issue.explanation}
          </div>

          <div
            style={{
              color: accent.color,
              textAlign: "right",
              fontWeight: 700,
              opacity: 0.8,
              whiteSpace: "nowrap",
            }}
          >
            investigate →
          </div>
        </div>
      </button>
    );
  }

  const overlapCount = overlapIssues.length;

  const ambiguityCount =
    joinIssues.filter(
      (i) => i.type === "JOIN_AMBIGUITY"
    ).length;

  const joinGapCount =
    joinIssues.filter(
      (i) => i.type === "JOIN_GAP"
    ).length;

  return (
    <div
      style={{
        flex: 1,
        background: "#ffffff",
        border: "1px solid #1e293b",
        boxSizing: "border-box",
        width: "100%",
        padding: 18,
        borderRadius: 12,
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        color: "#0f172a",
      }}
    >
      <h3 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 700 }}>
        Validation Findings
      </h3>
      {hasAnalyzed && hasFindings && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 16px",
            borderRadius: 12,
            background:
              validationRisk === "High"
                ? "#fef2f2"
                : validationRisk === "Medium"
                ? "#fffbeb"
                : "#ecfdf5",
            border:
              validationRisk === "High"
                ? "1px solid #fecaca"
                : validationRisk === "Medium"
                ? "1px solid #fde68a"
                : "1px solid #86efac",
            color:
              validationRisk === "High"
                ? "#991b1b"
                : validationRisk === "Medium"
                ? "#92400e"
                : "#166534",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          {validationRisk === "High"
            ? "🚨 High Validation Risk"
            : validationRisk === "Medium"
            ? "⚠️ Medium Validation Risk"
            : "✓ Low Validation Risk"}
          <span
            style={{
              marginLeft: 10,
              fontWeight: 500,
              color: "#64748b",
            }}
          >
            {`Detected: ${overlapCount} overlaps • ${ambiguityCount} ambiguous matches • ${joinGapCount} missing matches`}
          </span>
        </div>
      )}
      {!hasAnalyzed && (
        <div
          style={{
            padding: 16,
            borderRadius: 10,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#475569",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "#0f172a" }}>No analysis yet.</strong>
          <br />
          Load or paste two datasets and click Analyze Sources.
        </div>
      )}

      {hasAnalyzed && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {kpis.map((kpi) => {
            const isActive = activeIssueFilter === kpi.filter;

            return (
              <button
                key={kpi.label}
                onClick={() =>
                  setActiveIssueFilter(isActive ? "ALL" : kpi.filter)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  background: isActive ? kpi.background : "#f8fafc",
                  border: isActive
                    ? `1px solid ${kpi.color}`
                    : "1px solid #e2e8f0",
                  boxShadow: isActive
                    ? `0 0 0 2px ${kpi.color}22`
                    : "none",
                  borderRadius: 10,
                  padding: "12px 14px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s ease",
                  minHeight: 72,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      background: kpi.color,
                      color: "#ffffff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      flexShrink: 0,
                      fontSize: 17,
                    }}
                  >
                    {kpi.icon}
                  </span>

                  <div style={{ textAlign: "left", minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: isActive ? kpi.color : "#475569",
                        lineHeight: 1.2,
                        whiteSpace: "normal",
                        overflow: "visible",
                        textOverflow: "clip",
                      }}
                    >
                      {kpi.label}
                    </div>

                    <div
                      style={{
                        marginTop: 3,
                        fontSize: 12,
                        color: "#94a3b8",
                      }}
                    >
                      {kpi.value === 1 ? "1 finding" : `${kpi.value} findings`}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: "#0f172a",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  {kpi.value}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {hasAnalyzed && hasFindings && !shouldShowDetails && (
        <div
          style={{
            marginTop: 16,
            padding: 24,
            background: "#f8fafc",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            color: "#64748b",
            textAlign: "center",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Select a finding category to start investigating.
        </div>
      )}

      {hasAnalyzed && !hasFindings && (
        <div
          style={{
            marginTop: 16,
            padding: 24,
            background: "#ecfdf5",
            borderRadius: 12,
            border: "1px solid #86efac",
            color: "#166534",
            textAlign: "center",
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          ✓ No validation findings detected for the selected snapshot.
        </div>
      )}

      {hasAnalyzed && hasFindings && shouldShowDetails && (
        <>
          {(activeIssueFilter === "ALL" ||
            activeIssueFilter === "JOIN_GAP" ||
            activeIssueFilter === "JOIN_AMBIGUITY") &&
            filteredJoinIssues.length > 0 && (
              <div style={{ marginTop: 12 }}>
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1e40af",
                  padding: "12px 16px",
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                🔍 Click any finding below to investigate the root cause and recommended modeling strategy.
              </div>

                {filteredJoinIssues.map(renderJoinIssue)}

                {joinIssues.length > MAX_VISIBLE_JOIN_ISSUES && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    Showing first {MAX_VISIBLE_JOIN_ISSUES} of{" "}
                    {joinIssues.length} join findings.
                  </div>
                )}
              </div>
            )}
          {filteredOverlapIssues.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>
                Overlap Findings
              </h4>
              {filteredOverlapIssues.map(renderTemporalIssue)}
            </div>
          )}
          {filteredGapIssues.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>
                Valid-Time Coverage Gaps
              </h4>
              {filteredGapIssues.map(renderTemporalIssue)}
            </div>
          )}
          {filteredSnapshotDriftIssues.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>
                Snapshot Drift Findings
              </h4>
              {filteredSnapshotDriftIssues.map(renderTemporalIssue)}
            </div>
          )}
          {filteredDimensionCompletionIssues.length > 0 && (
            <button
              onClick={() => onSelectTemporalIssue(filteredDimensionCompletionIssues[0])}
              style={{
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                padding: "12px 14px",
                marginBottom: 8,
                borderRadius: 8,
                background: "#fff1f2",
                border: "1px solid #be123c",
                color: "#0f172a",
                fontFamily: "inherit",
                fontSize: 13,
                lineHeight: 1.35,
              }}
            >
              <strong style={{ color: "#9f1239" }}>
                Dimension completion risks
              </strong>
            
              <div style={{ marginTop: 6, color: "#475569" }}>
                {filteredDimensionCompletionIssues.length} source intervals are not fully covered by the target history.
              </div>
            
              <div style={{ marginTop: 6, color: "#9f1239", fontWeight: 700 }}>
                Click to inspect first affected interval →
              </div>
            </button>
          )}
          {filteredVisibilityLagIssues.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>
                Visibility Lag Findings
              </h4>
              {filteredVisibilityLagIssues.map(renderTemporalIssue)}
            </div>
          )}
        </>
      )}
    </div>
  );
}