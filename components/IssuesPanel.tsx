import type { JoinabilityIssue } from "@/lib/types";
import { track } from "@vercel/analytics";

type IssuesPanelProps = {
  result: string[];
  drifts: string[];
  joinIssues: JoinabilityIssue[];
  selectedIssue: JoinabilityIssue | null;
  setSelectedIssue: (j: JoinabilityIssue) => void;
};

export function IssuesPanel({
  result,
  drifts,
  joinIssues,
  selectedIssue,
  setSelectedIssue,
}: IssuesPanelProps) {
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
        result.map((e, i) => (
          <div
            key={i}
            style={{
              padding: 10,
              marginBottom: 8,
              borderRadius: 8,
              background: e.includes("OVERLAP") ? "#fee2e2" : "#fef3c7",
              border: e.includes("OVERLAP")
                ? "1px solid #ef4444"
                : "1px solid #f59e0b",
              color: "#111827",
              fontFamily: "monospace",
            }}
          >
            {e}
          </div>
        ))
      ) : (
        <p>No errors</p>
      )}

      {drifts.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h4>Source Drift</h4>

          {drifts.map((d, i) => (
            <div
              key={i}
              style={{
                padding: 10,
                marginBottom: 8,
                borderRadius: 8,
                background: "#fef3c7",
                border: "1px solid #f59e0b",
                color: "#92400e",
                fontFamily: "monospace",
              }}
            >
              {d}
            </div>
          ))}
        </div>
      )}

        <div style={{ marginTop: 16 }}>
          <h4 style={{ marginBottom: 6 }}>Joinability Issues</h4>

            {joinIssues.length === 0 ? (
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                Joinability issues will appear here after analyzing data with at least two sources.
              </p>
            ) : (
              <>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                Click an issue to see why it happens
              </p>

              {joinIssues.map((j, i) => (
                <div
                  key={i}
                  onClick={() => {
                    track("Issue Opened", {
                      type: j.type,
                      reason: j.reason,
                    });

                    setSelectedIssue(j);
                  }}
                  style={{
                    cursor: "pointer",
                    padding: 10,
                    marginBottom: 8,
                    borderRadius: 8,
                    background:
                      selectedIssue === j
                        ? "#e0f2fe"
                        : j.type === "JOIN_GAP"
                        ? "#fee2e2"
                        : "#fef3c7",
                    border:
                      selectedIssue === j
                        ? "2px solid #0f172a"
                        : j.type === "JOIN_GAP"
                        ? "1px solid #ef4444"
                        : "1px solid #f59e0b",
                    color: j.type === "JOIN_GAP" ? "#991b1b" : "#92400e",
                    fontFamily: "monospace",
                    fontSize: 13,
                    lineHeight: 1.5,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.01)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <strong>{j.type}</strong>
                  <span style={{ float: "right", fontSize: 11, opacity: 0.6 }}>
                    click for details →
                  </span>
                  <br />

                  {j.source} → {j.targetSource}
                  <br />
                  Entity: {j.entity_id}
                  <br />
                  Valid: {j.valid_from} → {j.valid_to}
                  <br />
                  Matches: {j.matchingRows}
                  <br />
                  Reason:{" "}
                  {j.reason === "NO_VISIBLE_OVERLAP"
                    ? "No visible-time overlap"
                    : j.reason === "NO_VALID_MATCH"
                    ? "No valid-time match"
                    : "Multiple matches"}
                </div>
              ))}
            </>
          )}
    </div>
    </div>
  );
}