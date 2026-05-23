import type { JoinabilityIssue } from "@/lib/types";
import { track } from "@vercel/analytics/server";

type SqlPanelProps = {
  sql: string;
  selectedIssue: JoinabilityIssue | null;
};

export function SqlPanel({ sql, selectedIssue }: SqlPanelProps) {
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
      <h3>SQL</h3>

      <pre
        style={{
          marginTop: 10,
          padding: "8px 12px",
          borderRadius: 8,
          background: "#111827",
          color: "#e5e7eb",
          border: "none",
          cursor: "pointer",
          whiteSpace: "pre-wrap",
        }}
      >
        {sql || "No SQL generated yet"}
      </pre>

      <button
      onClick={() => {
        track("SQL Copied");
        if (!sql) return;
        navigator.clipboard.writeText(sql);
      }}
        style={{
          marginTop: 10,
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

      {selectedIssue && (
        <div
          style={{
            marginTop: 20,
            background: "#f1f5f9",
            border: "1px solid #cbd5f5",
            borderRadius: 12,
            padding: 20,
          }}
        >

        <h3 style={{ marginTop: 0 }}>
          Why does this JOIN fail?
        </h3>
        <p style={{ fontWeight: "bold", marginBottom: 10 }}>
          This row cannot be joined cleanly to the other source.
        </p>
        <p>
          Visible time:
          <br />
          {selectedIssue.visible_from?.slice(0, 10)} →{" "}
          {selectedIssue.visible_to?.slice(0, 10) || "∞"}
        </p>
          {selectedIssue.type === "JOIN_GAP" && (
            <>
            <p>No matching row exists in the other data source.</p>
            {selectedIssue.reason === "NO_VISIBLE_OVERLAP" && (
              <>
                <p>
                  The records do not overlap in visible/system time.
                </p>
                <p>
                  {selectedIssue.source} visible until:{" "}
                  {selectedIssue.visible_to?.slice(0, 10)}
                  <br />
                  {selectedIssue.targetSource} visible from:{" "}
                  {selectedIssue.visible_from?.slice(0, 10)}
                </p>
                <p>
                  → They never exist at the same time
                </p>
            
                <p>
                  → The JOIN returns no rows
                </p>
              </>
            )}
            {selectedIssue.reason === "NO_VALID_MATCH" && (
              <>
                <p>
                  No row in the other source overlaps in valid time.
                </p>
                <p>→ There is no matching business-time record.</p>
              </>
            )}
            </>
          )}
          {selectedIssue.type === "JOIN_AMBIGUITY" && (
            <>
              <p>Multiple matching rows were found.</p>
              <p>→ The JOIN result is ambiguous.</p>
            </>
          )}
        </div>
        )}
      </div>
  );
}