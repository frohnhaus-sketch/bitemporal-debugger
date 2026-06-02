import { useEffect, useMemo, useState } from "react";
import type {
  AggregatedJoinabilityIssue,
  BitemporalRow,
  HighlightTarget,
  JoinabilityIssue,
  OverlapIssue,
} from "@/lib/types";

type DataPreviewProps = {
  title: string;
  rows: BitemporalRow[];
  joinIssues?: AggregatedJoinabilityIssue[];
  overlapMarkers?: OverlapIssue[];
  onSelectIssue?: (issue: AggregatedJoinabilityIssue) => void;
  highlightedRow?: HighlightTarget | null;
  onHighlightRow?: (target: HighlightTarget | null) => void;
  forceOpen?: boolean;
};

const COLUMN_STYLES: Record<string, string> = {
  entity_id: "#94a3b8",
  valid_from: "#64748b",
  valid_to: "#64748b",
  visible_from: "#64748b",
  visible_to: "#64748b",
  value: "#cbd5f5",
};

function getRowJoinIssue(
  row: BitemporalRow,
  joinIssues?: AggregatedJoinabilityIssue[]
) {
  return joinIssues?.find((issue) => {
    const sameSource = issue.source === row.source;
    const sameEntity = String(issue.entity_id) === String(row.entity_id);
    const sameValidWindow =
      issue.valid_from === row.valid_from &&
      issue.valid_to === row.valid_to;

    if (!sameSource || !sameEntity) return false;

    if (issue.isAggregated) {
      const entityMatch = issue.entityIds?.some(
        (id) => String(id) === String(row.entity_id)
      );

      return entityMatch && sameValidWindow;
    }

    return sameValidWindow;
  });
}

function getRowOverlapIssue(row: BitemporalRow, overlapMarkers?: OverlapIssue[]) {
  return overlapMarkers?.find((issue) => {
    const sameEntity = String(issue.entity_id) === String(row.entity_id);
    const sameSource = !("source" in issue) || issue.source === row.source;

    return sameEntity && sameSource;
  });
}

function getIssueRank({
  joinIssue,
  overlapIssue,
}: {
  joinIssue?: AggregatedJoinabilityIssue;
  overlapIssue?: OverlapIssue;
}) {
  if (joinIssue?.type === "JOIN_GAP") return 1;
  if (joinIssue?.type === "JOIN_AMBIGUITY") return 2;
  if (overlapIssue) return 3;

  return 4;
}

function getRowBackground({
  joinIssue,
  overlapIssue,
  isHovered,
}: {
  joinIssue?: JoinabilityIssue;
  overlapIssue?: OverlapIssue;
  isHovered: boolean;
}) {
  if (isHovered) return "rgba(56, 189, 248, 0.20)";
  if (joinIssue?.type === "JOIN_GAP") return "rgba(245, 158, 11, 0.22)";
  if (joinIssue?.type === "JOIN_AMBIGUITY") return "rgba(239, 68, 68, 0.16)";
  if (overlapIssue) return "rgba(239, 68, 68, 0.16)";

  return "transparent";
}

function isSameEntity(row: BitemporalRow, highlightedRow?: HighlightTarget | null) {
  return highlightedRow?.entity_id === String(row.entity_id);
}

function isExactHighlightedRow(
  row: BitemporalRow,
  highlightedRow?: HighlightTarget | null
) {
  return (
    highlightedRow?.entity_id === String(row.entity_id) &&
    highlightedRow?.source === row.source &&
    highlightedRow?.valid_from === row.valid_from &&
    highlightedRow?.valid_to === row.valid_to
  );
}

export function DataPreview({
  title,
  rows,
  joinIssues = [],
  overlapMarkers = [],
  onSelectIssue,
  highlightedRow,
  onHighlightRow,
  forceOpen,
}: DataPreviewProps) {
  const [open, setOpen] = useState(true);
  const [limit, setLimit] = useState(10);
  const [hoveredRowKey, setHoveredRowKey] = useState<string | null>(null);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  const rowSignature = useMemo(() => {
    return rows
      .map((r) => `${r.source}|${r.entity_id}|${r.valid_from}|${r.valid_to}|${r.visible_from}|${r.visible_to}`)
      .join(";");
  }, [rows]);

  useEffect(() => {
    setLimit(10);
  }, [rowSignature]);

  const columns = useMemo(() => {
    if (rows.length === 0) return [];

    return Object.keys(rows[0]).filter((column) => column !== "source");
  }, [rows]);

  const rowsWithIssues = useMemo(() => {
    return rows
      .map((row, originalIndex) => {
        const joinIssue = getRowJoinIssue(row, joinIssues);
        const overlapIssue = getRowOverlapIssue(row, overlapMarkers);
        const rank = getIssueRank({
          joinIssue,
          overlapIssue,
        });

        return {
          row,
          originalIndex,
          joinIssue,
          overlapIssue,
          rank,
        };
      })
      .sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank;

        const entityCompare = String(a.row.entity_id).localeCompare(
          String(b.row.entity_id),
          undefined,
          { numeric: true }
        );

        if (entityCompare !== 0) return entityCompare;

        return a.originalIndex - b.originalIndex;
      });
  }, [rows, joinIssues, overlapMarkers]);

  const visibleRows = rowsWithIssues.slice(0, limit);
  const issueRowCount = rowsWithIssues.filter((entry) => entry.rank < 4).length;

  if (rows.length === 0) return null;

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
        onMouseEnter={(event) => {
          event.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {open ? "▼" : "▶"} {title} ({rows.length} rows
        {issueRowCount > 0
          ? `, ${issueRowCount} issue row${issueRowCount === 1 ? "" : "s"}`
          : ""}
        )
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
                {columns.map((column) => (
                  <th
                    key={column}
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      borderBottom: "1px solid #1e293b",
                      color: "#e2e8f0",
                      background: COLUMN_STYLES[column]
                        ? `${COLUMN_STYLES[column]}22`
                        : "#020617",
                    }}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visibleRows.map(
                ({ row, originalIndex, joinIssue, overlapIssue }) => {
                  const exactHighlighted = isExactHighlightedRow(row, highlightedRow);
                  const sameEntityHighlighted = isSameEntity(row, highlightedRow);
                  const hasIssue = Boolean(joinIssue || overlapIssue);
                  const rowKey = `${row.source}-${row.entity_id}-${row.valid_from}-${row.valid_to}-${originalIndex}`;
                  const isHovered = hoveredRowKey === rowKey;

                  return (
                  <tr
                    key={rowKey}
                    onMouseEnter={() => {
                      setHoveredRowKey(rowKey);
                    
                      onHighlightRow?.({
                        entity_id: String(row.entity_id),
                        source: row.source,
                        valid_from: row.valid_from,
                        valid_to: row.valid_to,
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredRowKey(null);
                    }}
                    onClick={() => {
                      if (joinIssue) {
                        onSelectIssue?.(joinIssue);
                        return;
                      }
                    }}
                      title={
                        joinIssue
                          ? "Click to debug this join issue"
                          : overlapIssue
                          ? "Overlap detected for this entity"
                          : undefined
                      }
                      style={{
                        color: "#e2e8f0",
                        cursor: joinIssue ? "pointer" : "default",
                        background: isHovered
                          ? "rgba(56, 189, 248, 0.14)"
                          : exactHighlighted
                          ? "rgba(56, 189, 248, 0.22)"
                          : getRowBackground({
                              joinIssue,
                              overlapIssue,
                              isHovered: false,
                            }) !== "transparent"
                          ? getRowBackground({
                              joinIssue,
                              overlapIssue,
                              isHovered: false,
                            })
                          : sameEntityHighlighted
                          ? "rgba(56, 189, 248, 0.08)"
                          : "transparent",
                          outline: exactHighlighted
                            ? "2px solid #38bdf8"
                            : sameEntityHighlighted
                            ? "1px solid rgba(56, 189, 248, 0.55)"
                            : "none",
                        opacity: highlightedRow && !sameEntityHighlighted ? 0.7 : 1,
                        transition:
                          "opacity 0.15s ease, outline 0.15s ease, background 0.15s ease",
                      }}
                    >
                      {columns.map((column) => (
                        <td
                          key={column}
                          style={{
                            padding: "6px 8px",
                            borderBottom: "1px solid #1e293b",
                            whiteSpace: "nowrap",
                            fontWeight:
                              column === "value" || hasIssue ? "600" : "400",
                          }}
                        >
                          {String(row[column as keyof BitemporalRow] ?? "")}
                        </td>
                      ))}
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 8,
              fontSize: 11,
              color: "#64748b",
            }}
          >
            <span>
              showing {Math.min(limit, rows.length)} of {rows.length} rows
              {issueRowCount > 0 ? " · problem rows shown first" : ""}
            </span>

            <button
              onClick={() => setLimit(limit === 10 ? rows.length : 10)}
              style={{
                background: "none",
                border: "none",
                color: "#38bdf8",
                cursor: "pointer",
                fontSize: 11,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {limit === 10 ? "show all" : "show less"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}