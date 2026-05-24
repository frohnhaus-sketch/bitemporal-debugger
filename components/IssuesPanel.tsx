import type { AggregatedJoinabilityIssue, DriftSummary } from "@/lib/types";
import { track } from "@vercel/analytics";

type IssuesPanelProps = {
  result: string[];
  drifts: DriftSummary[];
  joinIssues: AggregatedJoinabilityIssue[];
  selectedIssue: AggregatedJoinabilityIssue | null;
  setSelectedIssue: (j: AggregatedJoinabilityIssue) => void;
};

function formatJoinReason(reason: string) {
  if (reason === "NO_VISIBLE_OVERLAP") return "No visible-time overlap";
  if (reason === "NO_VALID_MATCH") return "No valid-time match";
  if (reason === "MULTIPLE_MATCHES") return "Multiple matches";

  return reason;
}

function formatDriftText(drift: DriftSummary) {
  const minutes = Math.round(Math.abs(drift.lagMs) / 60000);

  return drift.lagMs > 0
    ? `${drift.sourceB} appears ${minutes} min after ${drift.sourceA}`
    : `${drift.sourceA} appears ${minutes} min after ${drift.sourceB}`;
}

export function IssuesPanel({
  result,
  drifts,
  joinIssues,
  selectedIssue,
  setSelectedIssue,
}: IssuesPanelProps) {
  const aggregatedJoinGaps = joinIssues.filter(
    (issue) => issue.type === "JOIN_GAP" && issue.isAggregated
  );

  const rootCause = aggregatedJoinGaps[0] ?? null;

  return (
    <div
      style={{
        flex: 1,
        background: "#ffffff",
        border: "1px solid #1e293b",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        color: "#0f172a",
      }}
    >
      <h3 style={{ marginBottom: 12, fontSize: 18 }}>Errors</h3>

      {result.length > 0 ? (
        result.map((error, index) => (
          <div
            key={index}
            style={{
              padding: 10,
              marginBottom: 8,
              borderRadius: 8,
              background: error.includes("OVERLAP") ? "#fee2e2" : "#fef3c7",
              border: error.includes("OVERLAP")
                ? "1px solid #ef4444"
                : "1px solid #f59e0b",
              color: "#111827",
              fontFamily: "monospace",
            }}
          >
            {error}
          </div>
        ))
      ) : (
        <p>No errors</p>
      )}

      {drifts.length > 0 && (
        <>
          <h3 style={{ marginTop: 16 }}>Source Drift</h3>

          {drifts.map((drift, index) => (
            <div
              key={index}
              style={{
                background: "#ecfeff",
                border: "1px solid #67e8f9",
                color: "#155e75",
                padding: 14,
                borderRadius: 10,
                marginBottom: 10,
              }}
            >
              <strong>INFO:</strong> {formatDriftText(drift)}
              <br />
              <span style={{ fontSize: 13 }}>
                Consistent across {drift.entityCount} entities. This looks like
                pipeline latency, not necessarily a join issue.
              </span>
            </div>
          ))}
        </>
      )}

      {rootCause && (
        <div
          style={{
            marginTop: 16,
            marginBottom: 16,
            padding: 14,
            borderRadius: 10,
            background: "#eff6ff",
            border: "1px solid #60a5fa",
            color: "#1e3a8a",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <strong>Likely root cause</strong>
          <br />
          {rootCause.count} entities fail with the same pattern:
          <br />
          <code>
            {rootCause.source} rows from {rootCause.valid_from} →{" "}
            {rootCause.valid_to} do not overlap with {rootCause.targetSource}
          </code>
          <br />
          <span>
            This looks like a systematic valid-time mismatch, not random bad
            rows.
          </span>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <h4 style={{ marginBottom: 6 }}>Joinability Issues</h4>

        {joinIssues.length === 0 ? (
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
            Joinability issues will appear here after analyzing data with at
            least two sources.
          </p>
        ) : (
          <>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
              Click an issue to see why it happens
            </p>

            {joinIssues.map((issue, index) => (
              <div
                key={index}
                onClick={() => {
                  track("Issue Opened", {
                    type: issue.type,
                    reason: issue.reason,
                    aggregated: Boolean(issue.isAggregated),
                  });

                  setSelectedIssue(issue);
                }}
                style={{
                  cursor: "pointer",
                  padding: 10,
                  marginBottom: 8,
                  borderRadius: 8,
                  background:
                    selectedIssue === issue
                      ? "#e0f2fe"
                      : issue.type === "JOIN_GAP"
                      ? "#fee2e2"
                      : "#fef3c7",
                  border:
                    selectedIssue === issue
                      ? "2px solid #0f172a"
                      : issue.type === "JOIN_GAP"
                      ? "1px solid #ef4444"
                      : "1px solid #f59e0b",
                  color: issue.type === "JOIN_GAP" ? "#991b1b" : "#92400e",
                  fontFamily: "monospace",
                  fontSize: 13,
                  lineHeight: 1.5,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = "scale(1.01)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = "scale(1)";
                }}
              >
                {issue.isAggregated ? (
                  <>
                    <strong>{issue.type} · systematic pattern</strong>
                    <span style={{ float: "right", fontSize: 11, opacity: 0.6 }}>
                      click for details →
                    </span>
                    <br />
                    {issue.source} → {issue.targetSource}
                    <br />
                    {issue.count} entities affected
                    <br />
                    Valid: {issue.valid_from} → {issue.valid_to}
                    <br />
                    Reason: {formatJoinReason(issue.reason)}
                    <br />
                    Root cause: repeated valid-time window mismatch
                    <br />
                    Examples: {issue.entityIds?.slice(0, 8).join(", ")}
                    {issue.entityIds && issue.entityIds.length > 8 ? " …" : ""}
                  </>
                ) : (
                  <>
                    <strong>{issue.type}</strong>
                    <span style={{ float: "right", fontSize: 11, opacity: 0.6 }}>
                      click for details →
                    </span>
                    <br />
                    {issue.source} → {issue.targetSource}
                    <br />
                    Entity: {issue.entity_id}
                    <br />
                    Valid: {issue.valid_from} → {issue.valid_to}
                    <br />
                    Matches: {issue.matchingRows}
                    <br />
                    Reason: {formatJoinReason(issue.reason)}
                  </>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}