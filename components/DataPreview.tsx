import { useState } from "react";
import type { JoinabilityIssue } from "@/lib/types";

type DataPreviewProps = {
  title: string;
  rows: any[];
  joinIssues?: JoinabilityIssue[];
  onSelectIssue?: (issue: JoinabilityIssue) => void;
  hoveredEntityId?: string | null;
  onHoverEntity?: (entityId: string | null) => void;
};

const COLUMN_STYLES: Record<string, string> = {
  entity_id: "#94a3b8",      // soft grey-blue
  valid_from: "#64748b",     // muted slate
  valid_to: "#64748b",
  visible_from: "#64748b",
  visible_to: "#64748b",
  value: "#cbd5f5",          // leicht heller (nur minimaler Fokus)
};

const IMPORTANT_COLUMNS = Object.keys(COLUMN_STYLES);

function getRowIssue(row: any, joinIssues?: JoinabilityIssue[]) {
  return joinIssues?.find(
    (j) =>
      String(j.entity_id) === String(row.entity_id) &&
      j.source === row.source &&
      j.valid_from === row.valid_from &&
      j.valid_to === row.valid_to
  );
}

export function DataPreview({
  title,
  rows,
  joinIssues = [],
  onSelectIssue,
  hoveredEntityId,
  onHoverEntity,
}: DataPreviewProps) {
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(10);

  if (rows.length === 0) return null;

  const columns = Object.keys(rows[0]).filter(
    (col) => col !== "source"
  );

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
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {open ? "▼" : "▶"} {title} ({rows.length} rows)
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
                      background: COLUMN_STYLES[col]
                        ? `${COLUMN_STYLES[col]}22`
                        : "#020617",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
            {rows.slice(0, limit).map((row, i) => {
              const issue = getRowIssue(row, joinIssues);
            
              return (
                <tr
                  key={i}
                  onClick={() => issue && onSelectIssue?.(issue)}
                  onMouseEnter={() => onHoverEntity?.(String(row.entity_id))}
                  onMouseLeave={() => onHoverEntity?.(null)}
                  title={issue ? "Click to debug this row" : undefined}
                  style={{
                    color: "#e2e8f0",
                    cursor: issue ? "pointer" : "default",
                    background:
                      issue?.type === "JOIN_GAP"
                        ? "rgba(239, 68, 68, 0.22)"
                        : issue?.type === "JOIN_AMBIGUITY"
                        ? "rgba(245, 158, 11, 0.22)"
                        : "transparent",
                  
                    outline:
                      hoveredEntityId && String(row.entity_id) === hoveredEntityId
                        ? "2px solid #38bdf8"
                        : "none",
                  
                    opacity:
                      hoveredEntityId && String(row.entity_id) !== hoveredEntityId
                        ? 0.45
                        : 1,
                  
                    transition: "opacity 0.15s ease, outline 0.15s ease",
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col}
                      style={{
                        padding: "6px 8px",
                        borderBottom: "1px solid #1e293b",
                        whiteSpace: "nowrap",
                        fontWeight: col === "value" ? "600" : "400",
                      }}
                    >
                      {String(row[col] ?? "")}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
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