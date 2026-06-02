import type { AggregatedJoinabilityIssue, TemporalIssue } from "@/lib/types";

type IssueWhyPanelProps = {
  selectedIssue: AggregatedJoinabilityIssue | null;
  selectedTemporalIssue: TemporalIssue | null;
};

function formatReason(reason?: string) {
  if (reason === "NO_VISIBLE_OVERLAP") return "No visible-time overlap";
  if (reason === "NO_VALID_MATCH") return "No valid-time match";
  if (reason === "MULTIPLE_MATCHES") return "Multiple matches";
  return reason ?? "Unknown reason";
}

export function IssueWhyPanel({
  selectedIssue,
  selectedTemporalIssue,
}: IssueWhyPanelProps) {
  const issue =
    selectedTemporalIssue?.originalIssue?.kind === "join"
      ? selectedTemporalIssue.originalIssue.issue
      : selectedIssue;

  if (!issue) return null;

  return (
    <div
      style={{
        marginTop: 14,
        padding: 14,
        borderRadius: 12,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#64748b",
          marginBottom: 8,
        }}
      >
        Why this finding?
      </div>

      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>
        {issue.type === "JOIN_AMBIGUITY"
          ? "Multiple rows match the same temporal join"
          : "No matching row exists for this temporal join"}
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.6, color: "#475569" }}>
        <div>
          <strong>Entity:</strong>{" "}
          {issue.isAggregated
            ? `${issue.count} entities`
            : issue.entity_id}
        </div>

        <div>
          <strong>Source:</strong> {issue.source} → {issue.targetSource}
        </div>

        <div>
          <strong>Valid interval:</strong> {issue.valid_from} →{" "}
          {issue.valid_to}
        </div>

        <div>
          <strong>Reason:</strong> {formatReason(issue.reason)}
        </div>
      </div>

      <div
        style={{
          marginTop: 10,
          padding: 10,
          borderRadius: 10,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          fontSize: 13,
          lineHeight: 1.5,
          color: "#334155",
        }}
      >
        {issue.type === "JOIN_AMBIGUITY" ? (
          <>
            The join condition finds more than one matching historical row.
            This can duplicate facts, inflate KPIs or make the result
            nondeterministic.
          </>
        ) : (
          <>
            The selected source interval cannot be resolved against the target
            source. A strict temporal join may drop this row or leave related
            attributes empty.
          </>
        )}
      </div>
    </div>
  );
}