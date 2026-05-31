type SelectedIssueCardProps = {
  issue: any | null;
};

function formatDate(value?: string) {
  if (!value) return "—";
  return value.slice(0, 10);
}

function getIssueLabel(type?: string) {
  if (type === "VALID_GAP") return "VALID GAP";
  if (type === "OVERLAP") return "OVERLAP";
  if (type === "JOIN_GAP") return "JOIN GAP";
  if (type === "JOIN_AMBIGUITY") return "JOIN AMBIGUITY";
  if (type === "VISIBILITY_LAG") return "VISIBILITY LAG";
  return type ?? "ISSUE";
}

function getIssueExplanation(issue: any) {
  switch (issue?.type) {
    case "VALID_GAP":
      return {
        what: "No record exists during this valid-time interval.",
        why: "Core layer snapshots may miss this entity for the affected period.",
        suggestion: "Inspect adjacent rows ordered by valid_from.",
        modeling:
          "Decide whether this is missing source history, a valid business absence, or requires a placeholder record.",
      };

    case "OVERLAP":
      return {
        what: "Multiple records are valid during the same interval.",
        why: "As-of queries may return duplicate or ambiguous results.",
        suggestion: "Check whether one record should end before the next one starts.",
        modeling:
          "Define whether one record supersedes another, whether a tie-breaking rule is needed, or whether multiple business states are valid.",
      };

    case "JOIN_GAP":
      return {
        what: "The selected source row has no matching row in the joined source.",
        why: "Core layer joins may drop or incomplete the entity state.",
        suggestion: "Compare valid-time and visible-time windows across both sources.",
        modeling:
          "Consider delayed synchronization, snapshot-based integration, placeholder records, or optional source relationships.",
      };

    case "JOIN_AMBIGUITY":
      return {
        what: "Multiple joined rows match the same source row.",
        why: "The Core layer may produce duplicated or ambiguous records.",
        suggestion: "Inspect overlapping candidates and define a tie-breaking rule.",
        modeling:
          "Consider priority rules, effective-dating logic, state reduction, or business key refinement.",
      };

    case "VISIBILITY_LAG":
      return {
        what: "A change became visible later than its valid-time suggests.",
        why: "Historical snapshots may differ depending on when the source update arrived.",
        suggestion: "Compare valid_from with visible_from and check source delivery behavior.",
        modeling:
          "Consider source latency buffers, delayed publication windows, or visibility-aware snapshots.",
      };

    default:
      return {
        what: "This issue needs investigation.",
        why: "It may affect historical correctness in the Core layer.",
        suggestion: "Inspect the related rows in the timeline.",
        modeling:
          "Clarify whether this pattern should be handled in source cleanup, integration logic, or downstream modeling.",
      };
  }
}

export default function SelectedIssueCard({ issue }: SelectedIssueCardProps) {
  if (!issue) return null;

  const explanation = getIssueExplanation(issue);

  const start =
    issue.start ??
    issue.from ??
    issue.valid_from ??
    issue.validFrom;

  const end =
    issue.end ??
    issue.to ??
    issue.valid_to ??
    issue.validTo;

  return (
    <div
      style={{
        marginBottom: 14,
        padding: 14,
        borderRadius: 12,
        background: "#0f172a",
        color: "#ffffff",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.08em",
          color: "#93c5fd",
          marginBottom: 6,
        }}
      >
        ISSUE INVESTIGATION
      </div>

      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
        {getIssueLabel(issue.type)}
      </div>

      <div
        style={{
          fontSize: 13,
          lineHeight: 1.5,
          marginBottom: 12,
          color: "#dbeafe",
        }}
      >
        {(issue.entity_id || issue.source) && (
          <div>
            {issue.entity_id ? `Entity ${issue.entity_id}` : ""}
            {issue.entity_id && issue.source ? " · " : ""}
            {issue.source ?? ""}
          </div>
        )}

        {(start || end) && (
          <div>
            {formatDate(start)} → {formatDate(end)}
          </div>
        )}

        <div
          style={{
            marginTop: 6,
            color: "#bfdbfe",
            fontWeight: 700,
          }}
        >
          View in timeline ↓
        </div>
      </div>

      <div style={{ display: "grid", gap: 8, fontSize: 13, lineHeight: 1.45 }}>
        <div>
          <strong>What happened?</strong>
          <br />
          {explanation.what}
        </div>

        <div>
          <strong>Why it matters?</strong>
          <br />
          {explanation.why}
        </div>

        <div>
          <strong>Suggested investigation</strong>
          <br />
          {explanation.suggestion}
        </div>

        <div>
          <strong>Suggested modeling pattern</strong>
          <br />
          {explanation.modeling}
        </div>
      </div>
    </div>
  );
}