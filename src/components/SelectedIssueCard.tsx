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

export default function SelectedIssueCard({ issue }: SelectedIssueCardProps) {
  if (!issue) return null;

  const start =
    issue.start ?? issue.from ?? issue.valid_from ?? issue.validFrom;

  const end =
    issue.end ?? issue.to ?? issue.valid_to ?? issue.validTo;

  return (
    <div
      style={{
        marginBottom: 12,
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
        SELECTED FINDING
      </div>

      <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>
        {issue.title ?? getIssueLabel(issue.type)}
      </div>

      <div
        style={{
          fontSize: 13,
          lineHeight: 1.45,
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

        {issue.targetSource && (
          <div style={{ opacity: 0.85 }}>
            Compared with {issue.targetSource}
          </div>
        )}
      </div>
    </div>
  );
}