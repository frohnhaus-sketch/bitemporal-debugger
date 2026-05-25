import type { AggregatedJoinabilityIssue } from "@/lib/types";
import { track } from "@/lib/analytics";
import { explainJoinIssue } from "@/lib/explainJoinIssue";

type SqlPanelProps = {
  sql: string;
  selectedIssue: AggregatedJoinabilityIssue | null;
};

export function SqlPanel({ sql, selectedIssue }: SqlPanelProps) {
  const explanation = selectedIssue ? explainJoinIssue(selectedIssue) : null;

  function buildDebugReport() {
    if (!selectedIssue || !explanation) return "";

    return `
JOIN DEBUG REPORT

Issue: ${explanation.title}

What happened:
${explanation.summary}

Why it happened:
${explanation.cause}

Why it matters:
${explanation.interpretation}

Context:
Source: ${selectedIssue.source} → ${selectedIssue.targetSource}
Entity: ${
      selectedIssue.isAggregated
        ? `${selectedIssue.count} entities`
        : selectedIssue.entity_id
    }
Valid-time: ${selectedIssue.valid_from} → ${selectedIssue.valid_to}
${
  selectedIssue.visible_from
    ? `Visible-time: ${selectedIssue.visible_from} → ${
        selectedIssue.visible_to || "∞"
      }`
    : ""
}

Suggested fixes:
${(explanation.fixes ?? []).map((f) => `- ${f}`).join("\n")}

${
  explanation.sqlSuggestion
    ? `Suggested SQL:\n${explanation.sqlSuggestion}`
    : ""
}
`.trim();
  }

  return (
    <div
      style={{
        flex: 1,
        background: "#ffffff",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        color: "#0f172a",
      }}
    >
      <h3>SQL & Fix Suggestions</h3>

      <pre
        style={{
          marginTop: 10,
          padding: "8px 12px",
          borderRadius: 8,
          background: "#111827",
          color: "#e5e7eb",
          border: "none",
          whiteSpace: "pre-wrap",
        }}
      >
        {sql || "No SQL generated yet"}
      </pre>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 10,
          marginTop: 10,
        }}
      >
        <button
          onClick={() => {
            track("SQL Copied");
            if (!sql) return;
            navigator.clipboard.writeText(sql);
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "#e2e8f0",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Copy SQL
        </button>
      </div>

      {selectedIssue && explanation && (
        <>
          <div
            style={{
              marginTop: 20,
              background:
                explanation.severity === "error" ? "#fee2e2" : "#fff7ed",
              border:
                explanation.severity === "error"
                  ? "1px solid #ef4444"
                  : "1px solid #f59e0b",
              borderRadius: 12,
              padding: 20,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                color: "#64748b",
                marginBottom: 6,
              }}
            >
              Join explanation
            </div>

            <h3 style={{ marginTop: 0, marginBottom: 10 }}>
              Why does this JOIN fail?
            </h3>

            <h4 style={{ margin: "0 0 10px 0", fontSize: 16 }}>
              {explanation.title}
            </h4>

            <div style={{ marginBottom: 12 }}>
              <strong>What happened</strong>
              <br />
              {explanation.summary}
            </div>

            <div style={{ marginBottom: 12 }}>
              <strong>Why it happened</strong>
              <br />
              {explanation.cause}
            </div>

            <div style={{ marginBottom: 12 }}>
              <strong>Why it matters</strong>
              <br />
              {explanation.interpretation}
            </div>

            <div
              style={{
                marginBottom: 12,
                padding: 12,
                borderRadius: 10,
                background: "#ffffff",
                border: "1px solid rgba(15, 23, 42, 0.12)",
              }}
            >
              <strong>
                {selectedIssue.isAggregated
                  ? "Affected pattern"
                  : "Affected row"}
              </strong>

              <div style={{ marginTop: 8 }}>
                <div>
                  <strong>Join direction:</strong> {selectedIssue.source} →{" "}
                  {selectedIssue.targetSource}
                </div>

                <div>
                  <strong>Entity:</strong>{" "}
                  {selectedIssue.isAggregated
                    ? `${selectedIssue.count} entities affected`
                    : selectedIssue.entity_id}
                </div>

                <div>
                  <strong>Valid-time:</strong> {selectedIssue.valid_from} →{" "}
                  {selectedIssue.valid_to}{" "}
                  <span style={{ color: "#64748b" }}>[inclusive]</span>
                </div>

                {selectedIssue.visible_from && (
                  <div>
                    <strong>Visible-time:</strong>{" "}
                    {selectedIssue.visible_from} →{" "}
                    {selectedIssue.visible_to || "∞"}{" "}
                    <span style={{ color: "#64748b" }}>[half-open)</span>
                  </div>
                )}

                <div>
                  <strong>Reason:</strong> {selectedIssue.reason}
                </div>

                {typeof selectedIssue.matchingRows !== "undefined" && (
                  <div>
                    <strong>Matching rows:</strong>{" "}
                    {selectedIssue.matchingRows}
                  </div>
                )}

                {selectedIssue.isAggregated && selectedIssue.entityIds && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Example entities:</strong>{" "}
                    {selectedIssue.entityIds.slice(0, 10).join(", ")}
                    {selectedIssue.entityIds.length > 10 ? " …" : ""}
                  </div>
                )}
              </div>
            </div>

            <div>
              <strong>What to check next</strong>
              <ul style={{ margin: "6px 0 0 0", paddingLeft: 18 }}>
                {explanation.hints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            </div>

            {explanation.fixes && explanation.fixes.length > 0 && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 10,
                  background: "#ecfdf5",
                  border: "1px solid #86efac",
                }}
              >
                <strong>How to fix this</strong>
                <ul style={{ margin: "6px 0 0 0", paddingLeft: 18 }}>
                  {explanation.fixes.map((fix) => (
                    <li key={fix}>{fix}</li>
                  ))}
                </ul>
              </div>
            )}

            {explanation.sqlSuggestion && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 10,
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                }}
              >
                <strong>Suggested SQL pattern</strong>
                <pre
                  style={{
                    marginTop: 8,
                    padding: 10,
                    borderRadius: 8,
                    background: "#111827",
                    color: "#e5e7eb",
                    whiteSpace: "pre-wrap",
                    fontSize: 12,
                  }}
                >
                  {explanation.sqlSuggestion}
                </pre>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              const report = buildDebugReport();
              if (!report) return;

              track("Debug Report Copied");
              navigator.clipboard.writeText(report);
            }}
            style={{
              display: "block",
              marginTop: 14,
              padding: "10px 14px",
              borderRadius: 8,
              background: "#0f172a",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Copy debug report
          </button>
        </>
      )}
    </div>
  );
}