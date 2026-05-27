import type { AggregatedJoinabilityIssue } from "@/lib/types";

type Props = {
  issue: AggregatedJoinabilityIssue | null;
  onClear?: () => void;
};

function getIssueText(issue: AggregatedJoinabilityIssue) {
  if (issue.type === "JOIN_AMBIGUITY") {
    return {
      label: "Ambiguous join",
      color: "#ef4444",
      title: "This JOIN can return duplicate or misleading rows.",
      summary:
        "Multiple matching rows exist in the other source for the same time range.",
      impact:
        "The JOIN result is not unique. This can create duplicated rows, inflated counts, or misleading history.",
      check:
        "Check whether the matching rows overlap in valid-time, visible-time, or both.",
      suggestedFix:
        "Ensure that only one record is valid per time slice. You may need to split intervals, add stricter join conditions, or deduplicate overlapping records before joining.",
      sqlHint: `-- Detect multiple temporal matches
SELECT
  a.entity_id,
  a.valid_from,
  a.valid_to,
  COUNT(*) AS matching_rows
FROM source_a a
JOIN source_b b
  ON a.entity_id = b.entity_id
 AND a.valid_from <= b.valid_to
 AND b.valid_from <= a.valid_to
GROUP BY
  a.entity_id,
  a.valid_from,
  a.valid_to
HAVING COUNT(*) > 1;`,
    };
  }

  if (issue.type === "JOIN_GAP") {
    const isVisibleGap = issue.reason === "NO_VISIBLE_OVERLAP";

    return {
      label: "No temporal match",
      color: "#f59e0b",
      title: "This row has no matching record in the other source.",
      summary: isVisibleGap
        ? "A valid-time match exists, but the records were not visible at the same time."
        : "No matching valid-time record exists in the other source.",
      impact:
        "The JOIN may drop this row or produce missing data in downstream results.",
      check: isVisibleGap
        ? "Check visible_from / visible_to timestamps and whether the sources were updated out of sync."
        : "Check missing valid-time periods, source completeness, or join keys.",
      suggestedFix: isVisibleGap
        ? "Align visible-time ranges or join both sources using a consistent visible snapshot."
        : "Fill missing valid-time intervals, fix source completeness, or explicitly handle gaps in downstream logic.",
      sqlHint: isVisibleGap
        ? `-- Bitemporal overlap condition
SELECT *
FROM source_a a
JOIN source_b b
  ON a.entity_id = b.entity_id
 AND a.valid_from <= b.valid_to
 AND b.valid_from <= a.valid_to
 AND a.visible_from < COALESCE(b.visible_to, '9999-12-31T00:00:00')
 AND b.visible_from < COALESCE(a.visible_to, '9999-12-31T00:00:00');`
        : `-- Find rows with no valid-time match
SELECT a.*
FROM source_a a
LEFT JOIN source_b b
  ON a.entity_id = b.entity_id
 AND a.valid_from <= b.valid_to
 AND b.valid_from <= a.valid_to
WHERE b.entity_id IS NULL;`,
    };
  }

  return {
    label: "Join issue",
    color: "#64748b",
    title: "This JOIN issue needs review.",
    summary: issue.message ?? "A temporal join issue was detected.",
    impact: "The result may not represent the intended historical state.",
    check: "Review the affected time range and matching records.",
    suggestedFix:
      "Inspect the affected rows and decide whether the issue is caused by missing data, overlapping intervals, or inconsistent temporal assumptions.",
    sqlHint: `-- Review affected entity
SELECT *
FROM source_a
WHERE entity_id = '${String(issue.entity_id)}'

UNION ALL

SELECT *
FROM source_b
WHERE entity_id = '${String(issue.entity_id)}';`,
  };
}

export function IssueExplanation({ issue, onClear }: Props) {
  if (!issue) return null;

  const text = getIssueText(issue);

  return (
    <div
      style={{
        marginTop: 20,
        padding: 18,
        borderRadius: 12,
        background: "#f8fafc",
        border: `1px solid ${text.color}`,
        color: "#0f172a",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 8px",
          borderRadius: 999,
          background: `${text.color}22`,
          color: text.color,
          fontSize: 12,
          fontWeight: 800,
          marginBottom: 10,
        }}
      >
        {text.label}
      </div>

      <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{text.title}</h3>

      <p style={{ margin: "0 0 12px", fontSize: 14, color: "#475569" }}>
        {text.summary}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 12,
        }}
      >
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
          }}
        >
          <strong style={{ fontSize: 13 }}>Impact</strong>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#475569" }}>
            {text.impact}
          </p>
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 10,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
          }}
        >
          <strong style={{ fontSize: 13 }}>Check next</strong>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#475569" }}>
            {text.check}
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 10,
          background: "#ecfeff",
          border: "1px solid #67e8f9",
        }}
      >
        <strong style={{ fontSize: 13, color: "#0e7490" }}>
          Suggested fix
        </strong>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#0f172a" }}>
          {text.suggestedFix}
        </p>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 10,
          background: "#020617",
          color: "#e2e8f0",
          border: "1px solid #1e293b",
        }}
      >
        <div
          style={{
            marginBottom: 8,
            fontSize: 12,
            fontWeight: 800,
            color: "#93c5fd",
          }}
        >
          SQL hint
        </div>

        <pre
          style={{
            margin: 0,
            fontSize: 12,
            lineHeight: 1.5,
            overflowX: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {text.sqlHint}
        </pre>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 12,
          color: "#64748b",
        }}
      >
        Source: <strong>{issue.source}</strong> →{" "}
        <strong>{issue.targetSource}</strong> · Entity:{" "}
        <strong>{String(issue.entity_id)}</strong> · Valid:{" "}
        <strong>{issue.valid_from}</strong> → <strong>{issue.valid_to}</strong>
      </div>

      {onClear && (
        <button
          onClick={onClear}
          style={{
            marginTop: 12,
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#475569",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Clear explanation
        </button>
      )}
    </div>
  );
}