import { useState } from "react";
import type { JoinabilityIssue } from "@/lib/types";

type DataPreviewProps = {
  rows: any[];
  joinIssues: JoinabilityIssue[];
  onSelectIssue: (issue: JoinabilityIssue) => void;
};

const IMPORTANT_COLUMNS = [
  "source",
  "entity_id",
  "valid_from",
  "valid_to",
  "visible_from",
  "visible_to",
];

export function DataPreview({
  rows,
  joinIssues,
  onSelectIssue,
}: DataPreviewProps) {
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(10);

  if (rows.length === 0) return null;

  const columns = Object.keys(rows[0]);

  return (
    <div
      style={{
        marginBottom: 20,
        background: "#020617",
        borderRadius: 8,
        border: "1px solid #1e293b",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "8px 10px",
          background: "#111827",
          color: "#e2e8f0",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontWeight: "bold",
        }}
      >
        {open ? "▼" : "▶"} Parsed data preview ({rows.length} rows)
      </button>

      {open && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
            }}
          >
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      borderBottom: "1px solid #1e293b",
                      color: "#e2e8f0",
                      background: IMPORTANT_COLUMNS.includes(col)
                        ? "#1e40af"
                        : "#020617",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
            {rows.slice(0, limit).map((r, i) => {
              const issue = joinIssues.find(
                (j) =>
                  String(j.entity_id) === String(r.entity_id) &&
                  j.source === r.source
              );
          
              return (
                <tr
                  key={i}
                  onClick={() => {
                    if (issue) onSelectIssue(issue);
                  }}
                  title={issue ? "Click to debug this row" : undefined}
                  style={{
                    color: "#e2e8f0",
                    cursor: issue ? "pointer" : "default",
                    background: issue
                      ? issue.type === "JOIN_GAP"
                        ? "rgba(239, 68, 68, 0.18)"
                        : "rgba(245, 158, 11, 0.18)"
                      : "transparent",
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col}
                      style={{
                        padding: "6px 8px",
                        borderBottom: "1px solid #1e293b",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {String(r[col] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
            </tbody>
          </table>

          <div
            style={{
              padding: 6,
              fontSize: 11,
              color: "#64748b",
              textAlign: "right",
            }}
          >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 6,
              fontSize: 11,
              color: "#64748b",
            }}
          >
            <span>
              showing {Math.min(limit, rows.length)} of {rows.length} rows
            </span>
          
            <button
              onClick={() =>
                setLimit(limit === 10 ? rows.length : 10)
              }
              style={{
                background: "none",
                border: "none",
                color: "#38bdf8",
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              {limit === 10 ? "show all" : "show less"}
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}