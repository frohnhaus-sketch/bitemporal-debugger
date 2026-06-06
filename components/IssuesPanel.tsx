import type { AggregatedJoinabilityIssue, TemporalIssue } from "@/lib/types";
import { track } from "@/lib/analytics";
import { useState } from "react";
import SelectedIssueCard from "./SelectedIssueCard";

type IssuesPanelProps = {
  joinIssues: AggregatedJoinabilityIssue[];
  selectedIssue: AggregatedJoinabilityIssue | null;
  setSelectedIssue: (j: AggregatedJoinabilityIssue | null) => void;
  temporalIssues: TemporalIssue[];
  selectedTemporalIssue: TemporalIssue | null;
  onSelectTemporalIssue: (issue: TemporalIssue | null) => void;
  hasAnalyzed: boolean;
};

function formatJoinReason(reason: string) {
  if (reason === "NO_VISIBLE_OVERLAP") return "No visible-time overlap";
  if (reason === "NO_VALID_MATCH") return "No valid-time match";
  if (reason === "MULTIPLE_MATCHES") return "Multiple matches";
  return reason;
}

export function IssuesPanel({
  joinIssues,
  selectedIssue,
  setSelectedIssue,
  temporalIssues,
  selectedTemporalIssue,
  onSelectTemporalIssue,
  hasAnalyzed,
}: IssuesPanelProps) {
  const [activeIssueFilter, setActiveIssueFilter] = useState<
    "ALL" | "JOIN" | "VALID_GAP" | "OVERLAP" | "VISIBILITY_LAG"
  >("ALL");

  const gapIssues = temporalIssues.filter((issue) => issue.type === "VALID_GAP");
  const overlapIssues = temporalIssues.filter((issue) => issue.type === "OVERLAP");
  const visibilityLagIssues = temporalIssues.filter(
    (issue) => issue.type === "VISIBILITY_LAG"
  );

  const aggregatedJoinGaps = joinIssues.filter(
    (issue) => issue.type === "JOIN_GAP" && issue.isAggregated
  );

  const MAX_VISIBLE_JOIN_ISSUES = 50;
  const visibleJoinIssues = joinIssues.slice(0, MAX_VISIBLE_JOIN_ISSUES);

  const filteredJoinIssues =
    activeIssueFilter === "ALL" || activeIssueFilter === "JOIN"
      ? visibleJoinIssues
      : [];

  const filteredGapIssues =
    activeIssueFilter === "ALL" || activeIssueFilter === "VALID_GAP"
      ? gapIssues
      : [];

  const filteredOverlapIssues =
    activeIssueFilter === "ALL" || activeIssueFilter === "OVERLAP"
      ? overlapIssues
      : [];

  const filteredVisibilityLagIssues =
    activeIssueFilter === "ALL" || activeIssueFilter === "VISIBILITY_LAG"
      ? visibilityLagIssues
      : [];

  const kpis = [
    { label: "Missing Matches", value: joinIssues.length, filter: "JOIN" },
    { label: "Missing Coverage", value: gapIssues.length, filter: "VALID_GAP" },
    { label: "Overlapping History", value: overlapIssues.length, filter: "OVERLAP" },
    { label: "Visibility Lag", value: visibilityLagIssues.length, filter: "VISIBILITY_LAG" },
  ] as const;

  const hasFindings = kpis.some((kpi) => kpi.value > 0);

  const rootCause = aggregatedJoinGaps[0] ?? null;

  function renderTemporalIssue(issue: TemporalIssue) {
    const isSelected = selectedTemporalIssue?.id === issue.id;

    return (
      <button
        key={issue.id}
        onClick={() => {
          track("temporal_issue_selected", {
            type: issue.type,
            severity: issue.severity,
            source: issue.source,
          });

          onSelectTemporalIssue(issue);
        }}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "9px 10px",
          marginBottom: 8,
          borderRadius: 8,
          border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
          background: isSelected ? "#eff6ff" : "#ffffff",
          cursor: "pointer",
          color: "#0f172a",
          fontFamily: "inherit",
          fontSize: 12,
          lineHeight: 1.35,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div style={{ fontWeight: 800 }}>{issue.title}</div>

        <div style={{ color: "#64748b", marginTop: 3 }}>
          Entity {issue.entity_id}
          {issue.source ? ` · ${issue.source}` : ""}
        </div>

        {issue.from && issue.to && (
          <div style={{ color: "#94a3b8", marginTop: 3 }}>
            {issue.from} → {issue.to}
          </div>
        )}

        {issue.type === "VISIBILITY_LAG" && issue.targetSource && (
          <div style={{ color: "#94a3b8", marginTop: 3 }}>
            Compared with {issue.targetSource}
          </div>
        )}

        <div style={{ color: "#64748b", marginTop: 5 }}>
          {issue.explanation}
        </div>
      </button>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        background: "#ffffff",
        border: "1px solid #1e293b",
        padding: 18,
        borderRadius: 12,
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        color: "#0f172a",
      }}
    >
      <h3 style={{ margin: "0 0 10px", fontSize: 17 }}>
        Validation Findings
      </h3>

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
          Load or paste two datasets and click Analyze Sources to detect temporal
          alignment issues.
        </div>
      )}

      {hasAnalyzed && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 10,
            marginBottom: 12,
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
                  gap: 10,
                  background: isActive ? "#eff6ff" : "#f8fafc",
                  border: isActive ? "1px solid #3b82f6" : "1px solid #e2e8f0",
                  boxShadow: isActive
                    ? "0 0 0 2px rgba(59,130,246,0.18)"
                    : "none",
                  borderRadius: 8,
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s ease",
                  minHeight: 54,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    textAlign: "left",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isActive ? "#1d4ed8" : "#475569",
                      lineHeight: 1.2,
                    }}
                  >
                    {kpi.label}
                  </div>
                  
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 11,
                      color: "#94a3b8",
                    }}
                  >
                    {kpi.value === 1 ? "1 finding" : `${kpi.value} findings`}
                  </div>
                </div>
                  
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#0f172a",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {kpi.value}
                </div>
              </button>
            );
          })}
        </div>
      )}
      
      {hasAnalyzed && (
        <>
      {/* <SelectedIssueCard issue={selectedTemporalIssue} /> */}

      {(activeIssueFilter === "ALL" || activeIssueFilter === "JOIN") &&
        rootCause && (
          <div
            style={{
              marginTop: 12,
              marginBottom: 12,
              padding: 12,
              borderRadius: 10,
              background: "#eff6ff",
              border: "1px solid #60a5fa",
              color: "#1e3a8a",
              fontSize: 12,
              lineHeight: 1.45,
            }}
          >
            <strong>Historical Modeling Guidance</strong>
            <br />
            {rootCause.count} entities fail with the same pattern:
            <br />
            <code>
              {rootCause.source} rows from {rootCause.valid_from} →{" "}
              {rootCause.valid_to} do not overlap with{" "}
              {rootCause.targetSource}
            </code>
            <br />
            <span>
              This suggests a systematic source alignment issue for Core Layer
              modeling.
            </span>
          </div>
        )}
        </>
      )}

      {(activeIssueFilter === "ALL" || activeIssueFilter === "JOIN") && (
        <div style={{ marginTop: 12 }}>
          {filteredJoinIssues.length === 0 ? (
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
              Source alignment findings will appear here after analyzing two
              sources.
            </p>
          ) : (
            <>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                Click a finding to open the explanation.
              </p>

              {filteredJoinIssues.map((issue, index) => {
                const isSelected = selectedIssue === issue;

                return (
                  <button
                    key={index}
                    onClick={() => {
                      track("issue_selected", {
                        type: issue.type,
                        reason: issue.reason,
                        aggregated: Boolean(issue.isAggregated),
                      });

                      setSelectedIssue(issue);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      padding: "9px 10px",
                      marginBottom: 8,
                      borderRadius: 8,
                      background: isSelected
                        ? "#e0f2fe"
                        : issue.type === "JOIN_AMBIGUITY"
                        ? "#fee2e2"
                        : "#fef3c7",
                      border: isSelected
                        ? "2px solid #0f172a"
                        : issue.type === "JOIN_AMBIGUITY"
                        ? "1px solid #ef4444"
                        : "1px solid #f59e0b",
                      color:
                        issue.type === "JOIN_AMBIGUITY"
                          ? "#991b1b"
                          : "#92400e",
                      fontFamily: "inherit",
                      fontSize: 12,
                      lineHeight: 1.35,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <strong>
                      {issue.type}
                      {issue.isAggregated ? " · systematic pattern" : ""}
                    </strong>

                    <span style={{ float: "right", fontSize: 11, opacity: 0.6 }}>
                      investigate →
                    </span>

                    <br />

                    {issue.source} → {issue.targetSource}
                    {issue.isAggregated
                      ? ` · ${issue.count} entities`
                      : ` · Entity ${issue.entity_id}`}

                    <br />
                    {issue.valid_from} → {issue.valid_to}

                    <br />
                    Reason: {formatJoinReason(issue.reason)}
                  </button>
                );
              })}

              {joinIssues.length > MAX_VISIBLE_JOIN_ISSUES && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                  Showing first {MAX_VISIBLE_JOIN_ISSUES} of{" "}
                  {joinIssues.length} join issues.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {filteredVisibilityLagIssues.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>
            Visibility Lag Findings
          </h4>
          {filteredVisibilityLagIssues.map(renderTemporalIssue)}
        </div>
      )}

      {activeIssueFilter === "VISIBILITY_LAG" &&
        filteredVisibilityLagIssues.length === 0 && (
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 12 }}>
            No visibility lag findings detected.
          </p>
        )}

      {filteredOverlapIssues.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>
            Overlap Findings
          </h4>
          {filteredOverlapIssues.map(renderTemporalIssue)}
        </div>
      )}

      {activeIssueFilter === "OVERLAP" &&
        filteredOverlapIssues.length === 0 && (
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 12 }}>
            No overlap findings detected.
          </p>
        )}

      {filteredGapIssues.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>
            Valid-Time Coverage Gaps
          </h4>
          {filteredGapIssues.map(renderTemporalIssue)}
        </div>
      )}

      {activeIssueFilter === "VALID_GAP" && filteredGapIssues.length === 0 && (
        <p style={{ fontSize: 12, color: "#64748b", marginTop: 12 }}>
          No valid-time coverage gaps detected.
        </p>
      )}

      {activeIssueFilter === "ALL" &&
        joinIssues.length === 0 &&
        filteredVisibilityLagIssues.length === 0 &&
        filteredOverlapIssues.length === 0 &&
        filteredGapIssues.length === 0 && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 10,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#475569",
              fontSize: 13,
            }}
          >
            No historical modeling findings detected.
            <br />
            The analyzed sources appear internally consistent for the selected
            checks.
          </div>
        )}
    </div>
  );
}