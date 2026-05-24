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
  const groupedRows = rows.reduce<Record<string, any[]>>((acc, row) => {
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
      <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>
        Timeline
      </h3>

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
          <h4 style={{ margin: "0 0 10px", color: "#0f172a" }}>
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
                  title={`${r.valid_from} → ${r.valid_to}`}
                  style={{
                    position: "absolute",
                    left: `${getPosition(r.valid_from)}%`,
                    width: `${getWidth(r.valid_from, r.valid_to)}%`,
                    height: "100%",
                    background: getSourceColor(r.source),
                    border: "none",
                    boxSizing: "border-box",
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
                      title={`${j.type}: ${j.message}`}
                      onClick={() => onSelectIssue?.(j)}
                      style={{
                        position: "absolute",
                        left: `${getPosition(j.valid_from)}%`,
                        width: `${getWidth(j.valid_from, j.valid_to)}%`,
                        height: "100%",
                        border:
                          j.type === "JOIN_GAP"
                            ? "3px dashed #ef4444"
                            : "3px dashed #f59e0b",
                        boxSizing: "border-box",
                        borderRadius: 999,
                        pointerEvents: "auto",
                        cursor: "pointer",
                        zIndex: 4,
                      }}
                    />
                  ))}
              </div>
            </div>
          ))}
          {sources.map((source) => {
            const sourceGaps = getEntitySourceGaps(entityId, String(source));
          
            if (sourceGaps.length === 0) return null;
          
            return (
              <div key={`gaps-${source}`} style={{ marginTop: 10 }}>
                <div style={{ marginBottom: 2, fontSize: 12 }}>
                <strong style={{ color: "#92400e", fontSize: 12 }}>
                  {String(source)} / {entityId} gaps
                </strong>

                <span style={{ marginLeft: 10, color: "#64748b", fontSize: 11 }}>
                  {sourceGaps.map((g) => `${g.from} → ${g.to}`).join(", ")}
                </span>
                </div>
            
                <div
                  style={{
                    height: 14,
                    background: "#f1f5f9",
                    borderRadius: 4,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {sourceGaps.map((g, j) => {
                    const gapFrom = g.from ?? g.valid_from;
                    const gapTo = g.to ?? g.valid_to;
                  
                    if (!gapFrom || !gapTo) return null;
                  
                    return (
                      <div
                        key={`gap-${j}`}
                        title={`GAP: ${gapFrom} → ${gapTo}`}
                        style={{
                          position: "absolute",
                          left: `${getPosition(gapFrom)}%`,
                          width: `${getWidth(gapFrom, gapTo)}%`,
                          height: "100%",
                          background: "#f59e0b",
                          opacity: 0.95,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        {sources.map((source) => {
          const sourceOverlaps = getEntitySourceOverlaps(entityId, String(source));
        
          if (sourceOverlaps.length === 0) return null;
        
          return (
            <div key={`overlaps-${source}`} style={{ marginTop: 10 }}>
              <div style={{ marginBottom: 2, fontSize: 12 }}>
              <strong style={{ color: "#991b1b", fontSize: 12 }}>
                {String(source)} / {entityId} overlaps
              </strong>

              <span style={{ marginLeft: 10, color: "#64748b", fontSize: 11 }}>
                {sourceOverlaps.map((o) => `${o.from} → ${o.to}`).join(", ")}
              </span>
              </div>
          
              <div
                style={{
                  height: 14,
                  background: "#f1f5f9",
                  borderRadius: 4,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {sourceOverlaps.map((o, k) => (
                  <div
                    key={`overlap-${k}`}
                    title={o.message}
                    style={{
                      position: "absolute",
                      left: `${getPosition(o.from)}%`,
                      width: `${getWidth(o.from, o.to)}%`,
                      height: "100%",
                      background: "#ef4444",
                      opacity: 0.9,
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
    </div>
  );
}