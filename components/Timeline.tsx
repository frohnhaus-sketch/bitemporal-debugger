import type { BitemporalRow, AggregatedJoinabilityIssue, OverlapIssue, TemporalIssue } from "@/lib/types";

type GapIssue = {
  entity_id: string | number;
  source?: string;
  from?: string;
  to?: string;
  valid_from?: string;
  valid_to?: string;
};

type TimelineProps = {
  rows: BitemporalRow[];
  gaps: GapIssue[];
  overlapMarkers: OverlapIssue[];
  getPosition: (date: string) => number;
  getWidth: (from: string, to: string) => number;
  highlightedEntityId: string | null;
  selectedIssue: AggregatedJoinabilityIssue | null;
  temporalIssues: TemporalIssue[];
  selectedTemporalIssue: TemporalIssue | null;
  onSelectTemporalIssue: (issue: TemporalIssue | null) => void;
};

function addOneDay(date: string) {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function normalizeGapStart(from: string, rowEndDates: string[]) {
  if (rowEndDates.includes(from)) {
    return addOneDay(from);
  }

  return from;
}

export function Timeline({
  rows,
  gaps,
  overlapMarkers,
  getPosition,
  getWidth,
  highlightedEntityId,
  selectedIssue,
  temporalIssues,
  selectedTemporalIssue,
  onSelectTemporalIssue,
}: TimelineProps) {

  const MAX_TIMELINE_ROWS = 80;
  const visibleRows = rows.slice(0, MAX_TIMELINE_ROWS);

  const focusedTemporalIssueEntityId = selectedTemporalIssue
  ? String(selectedTemporalIssue.entity_id)
  : null;

  const focusedEntityId = focusedTemporalIssueEntityId
   ?? (selectedIssue
     ? String(selectedIssue.entity_id)
     : highlightedEntityId
     ? String(highlightedEntityId)
     : null);

  const groupedRows = visibleRows.reduce<Record<string, BitemporalRow[]>>((acc, row) => {
    const key = String(row.entity_id ?? "unknown");
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  function getEntitySourceGaps(entityId: string, source: string) {
    return gaps.filter(
      (g) =>
        String(g.entity_id) === String(entityId) &&
        g.source === source
    );
  }

  function getEntitySourceOverlaps(entityId: string, source: string) {
    return overlapMarkers.filter(
      (o) =>
        String(o.entity_id) === String(entityId) &&
        o.source === source
    );
  }

  function getEntityTemporalIssues(
    entityId: string,
    source: string,
    row: BitemporalRow
  ) {
    return temporalIssues.filter((issue) => {
      if (String(issue.entity_id) !== String(entityId)) return false;
      if (issue.source !== source) return false;
      if (!issue.from || !issue.to) return false;
      if (issue.type === "JOIN_GAP" || issue.type === "JOIN_AMBIGUITY") {
        const originalJoinIssue =
          issue.originalIssue?.kind === "join"
            ? issue.originalIssue.issue
            : null;

        if (!originalJoinIssue) return false;

        return (
          originalJoinIssue.valid_from === row.valid_from &&
          originalJoinIssue.valid_to === row.valid_to
        );
      }

      return true;
    });
  }

  return (
    <div
      onClick={() => onSelectTemporalIssue(null)}
      style={{
        background: "#ffffff",
        color: "#0f172a",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >

      <p
        style={{
          margin: "4px 0 0",
          fontSize: 12,
          color: "#64748b",
          lineHeight: 1.6,
        }}
      >
Visualizes valid-time ranges and highlights gaps, overlaps, and join issues.
      {" "}
      <span style={{ marginLeft: 8, marginRight: 14, opacity: 0.5 }}>—</span>
      {" "}
      <span style={{ color: "#d1d5db" }}>■</span> No data
      {" "}
      ·
      {" "}
      <span style={{ color: "#64748b" }}>■</span> Valid interval
      {" "}
      ·
      {" "}
      <span style={{ color: "#f59e0b" }}>■</span> Gap
      {" "}
      ·
      {" "}
      <span style={{ color: "#ef4444" }}>■</span> Overlap
      {" "}
      · Dashed border = join issue
      </p>

      {selectedTemporalIssue && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectTemporalIssue(null);
          }}
          style={{
            marginTop: 10,
            marginBottom: 10,
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            background: "#f8fafc",
            color: "#334155",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Clear focus
        </button>
      )}

      {Object.entries(groupedRows).map(([entityId, entityRows]) => {
        const sources = Array.from(
          new Set(entityRows.map((r) => r.source).filter(Boolean))
        );

        return (
          <div
            key={entityId}
            style={{
              marginTop: 20,
              marginBottom: 28,
              opacity: focusedEntityId && focusedEntityId !== entityId ? 0.25 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            <h4
              style={{
                margin: "0 0 10px",
                color: "#0f172a",
                fontSize: 14,
                fontWeight: 800,
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: 6,
              }}
            >
              Entity {entityId}
            </h4>

            {entityRows.map((r, i) => {
              const isSelectedTemporalIssueRow =
                selectedTemporalIssue &&
                String(selectedTemporalIssue.entity_id) === String(r.entity_id) &&
                selectedTemporalIssue.source === r.source &&
                selectedTemporalIssue.from === r.valid_from &&
                selectedTemporalIssue.to === r.valid_to;

              const isSelectedIssueRow =
                isSelectedTemporalIssueRow ||
                (selectedIssue &&
                  String(selectedIssue.entity_id) === String(r.entity_id) &&
                  selectedIssue.source === r.source &&
                  selectedIssue.valid_from === r.valid_from &&
                  selectedIssue.valid_to === r.valid_to);
            
              return (
                <div
                  key={`${r.source}-${i}`}
                  style={{
                    marginBottom: 12,
                    opacity:
                      selectedTemporalIssue &&
                      String(selectedTemporalIssue.entity_id) === String(r.entity_id)
                        ? 1
                        : (selectedTemporalIssue || selectedIssue) && !isSelectedIssueRow
                        ? 0.35
                        : 1,
                    transition: "all 0.15s ease",
                  }}
                >
                <div style={{ marginBottom: 2, fontSize: 12 }}>
                  <strong>
                    {r.source || "default"} / {r.entity_id}
                  </strong>
                  <span
                    style={{
                      marginLeft: 10,
                      color: "#64748b",
                      fontSize: 11,
                    }}
                  >
                    {r.valid_from} → {r.valid_to}
                  </span>
                </div>

                <div
                  style={{
                    height: 14,
                    background: "#e5e7eb",
                    borderRadius: 999,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: `${getPosition(r.valid_from)}%`,
                      width: `${getWidth(r.valid_from, r.valid_to)}%`,
                      height: "100%",
                      background: "#64748b",
                      borderRadius: 999,
                      boxShadow: isSelectedIssueRow
                        ? "0 0 0 3px rgba(59,130,246,0.45)"
                        : "none",
                    }}
                  />

                  {getEntityTemporalIssues(String(r.entity_id), r.source, r).map((issue) => {
                    const isSelected = selectedTemporalIssue?.id === issue.id;
                  
                    const matchingValidGap =
                      issue.type === "JOIN_GAP"
                        ? temporalIssues.find(
                            (gapIssue) =>
                              gapIssue.type === "VALID_GAP" &&
                              String(gapIssue.entity_id) === String(issue.entity_id) &&
                              gapIssue.source === issue.source &&
                              gapIssue.from &&
                              gapIssue.to
                          )
                        : null;
                        
                    const displayFrom = matchingValidGap?.from ?? issue.from!;
                    const displayTo = matchingValidGap?.to ?? issue.to!;
                        
                    return (
                      <div
                        key={issue.id}
                        title={`${issue.title}: ${displayFrom} → ${displayTo}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTemporalIssue(issue);
                        }}
                        style={{
                          position: "absolute",
                          left: `${getPosition(displayFrom)}%`,
                          width: `${getWidth(displayFrom, displayTo)}%`,
                          height: "100%",
                          border:
                            issue.type === "JOIN_AMBIGUITY" || issue.type === "OVERLAP"
                              ? "3px dashed #ef4444"
                              : "3px dashed #f59e0b",
                          background: isSelected
                            ? "rgba(59, 130, 246, 0.25)"
                            : "transparent",
                          borderRadius: 999,
                          cursor: "pointer",
                          zIndex: 6,
                        }}
                      />
                    );
                  })}

                  {/* {joinIssues
                    .filter(
                      (j) =>
                        String(j.entity_id) === String(r.entity_id) &&
                        j.source === r.source
                    )
                    .map((j, k) => (
                      <div
                        key={`join-${k}`}
                        title={
                          j.type === "JOIN_AMBIGUITY"
                            ? "Ambiguous join: multiple matching records exist for this time range"
                            : "No temporal match: no corresponding record exists in the other dataset for this period"
                        }
                        onClick={() => onSelectIssue?.(j)}
                        style={{
                          position: "absolute",
                          left: `${getPosition(j.valid_from)}%`,
                          width: `${getWidth(j.valid_from, j.valid_to)}%`,
                          height: "100%",
                          border:
                            j.type === "JOIN_AMBIGUITY"
                              ? "3px dashed #ef4444"
                              : "3px dashed #f59e0b",
                          borderRadius: 999,
                          cursor: "pointer",
                          zIndex: 4,
                        }}
                      />
                    ))} */}
                </div>
              </div>
                );
              })}

            {/* GAPS */}
            {sources.map((source) => {
              const sourceGaps = getEntitySourceGaps(entityId, String(source));
              if (sourceGaps.length === 0) return null;

              return (
                <div key={`gaps-${source}`} style={{ marginTop: 10 }}>
                  <div style={{ marginBottom: 2, fontSize: 12 }}>
                    <strong style={{ color: "#92400e" }}>
                      {source} / {entityId} gaps
                    </strong>
                  </div>

                  <div
                    style={{
                      height: 14,
                      position: "relative",
                      background: "#f1f5f9",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    {sourceGaps.map((g, j) => {
                      const rawFrom = g.from ?? g.valid_from;
                      const to = g.to ?? g.valid_to;
                      if (!rawFrom || !to) return null;

                      const rowEndDates = entityRows
                        .filter((row) => row.source === source)
                        .map((row) => row.valid_to);

                      const from = normalizeGapStart(rawFrom, rowEndDates);
                    
                      const matchingIssue =
                        temporalIssues.find(
                          (issue) =>
                            issue.type === "VALID_GAP" &&
                            String(issue.entity_id) === String(g.entity_id) &&
                            issue.source === source
                        ) ?? null;
                      
                      const isSelected = selectedTemporalIssue?.id === matchingIssue?.id;
                      
                      return (
                        <div
                          key={j}
                          title={`Gap: no valid record exists between ${from} and ${to}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTemporalIssue(matchingIssue);
                          }}
                          style={{
                            position: "absolute",
                            left: `${getPosition(from)}%`,
                            width: `${getWidth(from, to)}%`,
                            height: "100%",
                            background: "#f59e0b",
                            cursor: "pointer",
                            zIndex: 10,
                            outline: isSelected ? "2px solid #2563eb" : "none",
                            outlineOffset: 2,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* OVERLAPS */}
            {sources.map((source) => {
              const overlaps = getEntitySourceOverlaps(entityId, String(source));
              if (overlaps.length === 0) return null;

              return (
                <div key={`overlaps-${source}`} style={{ marginTop: 10 }}>
                  <div style={{ marginBottom: 2, fontSize: 12 }}>
                    <strong style={{ color: "#991b1b" }}>
                      {source} / {entityId} overlaps
                    </strong>
                  </div>

                  <div
                    style={{
                      height: 14,
                      position: "relative",
                      background: "#f1f5f9",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    {overlaps.map((o, k) => {
                      const matchingIssue =
                        temporalIssues.find(
                          (issue) =>
                            issue.type === "OVERLAP" &&
                            String(issue.entity_id) === String(o.entity_id) &&
                            issue.source === source
                        ) ?? null;
                      
                      const isSelected = selectedTemporalIssue?.id === matchingIssue?.id;
                      
                      return (
                        <div
                          key={k}
                          title={`Overlap: multiple records are valid at the same time (${o.from} → ${o.to})`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTemporalIssue(matchingIssue);
                          }}
                          style={{
                            position: "absolute",
                            left: `${getPosition(o.from)}%`,
                            width: `${getWidth(o.from, o.to)}%`,
                            height: "100%",
                            background: "#ef4444",
                            cursor: "pointer",
                            zIndex: 10,
                            outline: isSelected ? "2px solid #2563eb" : "none",
                            outlineOffset: 2,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* LIMIT HINWEIS */}
      {rows.length > MAX_TIMELINE_ROWS && (
      <div
        style={{
          marginTop: 12,
          padding: "10px 12px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          fontSize: 12,
          color: "#64748b",
        }}
      >
        Showing first {MAX_TIMELINE_ROWS} of {rows.length} timeline rows to keep the
        view readable.
      </div>
      )}
    </div>
  );
}