import type { BitemporalRow, AggregatedJoinabilityIssue, OverlapIssue } from "@/lib/types";

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
  joinIssues: AggregatedJoinabilityIssue[];
  getPosition: (date: string) => number;
  getWidth: (from: string, to: string) => number;
  getSourceColor: (source: string) => string;
  onSelectIssue: (issue: AggregatedJoinabilityIssue) => void;
  highlightedEntityId: string | null;
};

export function Timeline({
  rows,
  gaps,
  overlapMarkers,
  joinIssues,
  getPosition,
  getWidth,
  getSourceColor,
  onSelectIssue,
  highlightedEntityId,
}: TimelineProps) {

  const MAX_TIMELINE_ROWS = 80;
  const visibleRows = rows.slice(0, MAX_TIMELINE_ROWS);

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

  return (
    <div
      style={{
        background: "#ffffff",
        color: "#0f172a",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>
          Timeline
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
          Visualizes valid-time ranges and highlights gaps, overlaps, and join issues.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 18,
          fontSize: 12,
          color: "#475569",
        }}
      >
        <span>■ Valid range</span>
        <span style={{ color: "#f59e0b" }}>■ Gap / missing match</span>
        <span style={{ color: "#ef4444" }}>■ Overlap / ambiguity</span>
        <span style={{ color: "#64748b" }}>Dashed border = join issue</span>
      </div>

      {Object.entries(groupedRows).map(([entityId, entityRows]) => {
        const sources = Array.from(
          new Set(entityRows.map((r) => r.source).filter(Boolean))
        );

        return (
          <div
            key={entityId}
            style={{
              marginBottom: 28,
              opacity:
                highlightedEntityId && highlightedEntityId !== entityId ? 0.35 : 1,
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

            {entityRows.map((r, i) => (
              <div key={`${r.source}-${i}`} style={{ marginBottom: 12 }}>
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
                      background: getSourceColor(r.source),
                      borderRadius: 4,
                      zIndex: 1,
                    }}
                  />

                  {joinIssues
                    .filter(
                      (j) =>
                        String(j.entity_id) === String(r.entity_id) &&
                        j.source === r.source
                    )
                    .map((j, k) => (
                      <div
                        key={`join-${k}`}
                        title={j.message}
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
                    ))}
                </div>
              </div>
            ))}

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
                      const from = g.from ?? g.valid_from;
                      const to = g.to ?? g.valid_to;
                      if (!from || !to) return null;

                      return (
                        <div
                          key={j}
                          style={{
                            position: "absolute",
                            left: `${getPosition(from)}%`,
                            width: `${getWidth(from, to)}%`,
                            height: "100%",
                            background: "#f59e0b",
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
                    {overlaps.map((o, k) => (
                      <div
                        key={k}
                        style={{
                          position: "absolute",
                          left: `${getPosition(o.from)}%`,
                          width: `${getWidth(o.from, o.to)}%`,
                          height: "100%",
                          background: "#ef4444",
                        }}
                      />
                    ))}
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