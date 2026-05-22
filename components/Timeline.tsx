import type { JoinabilityIssue, OverlapIssue } from "@/lib/types";

type TimelineProps = {
  rows: any[];
  gaps: any[];
  overlapMarkers: OverlapIssue[];
  joinIssues: JoinabilityIssue[];
  flaggedRows: Set<number>;
  getPosition: (date: string) => number;
  getWidth: (from: string, to: string) => number;
  getSourceColor: (source: string) => string;
};

export function Timeline({
  rows,
  gaps,
  overlapMarkers,
  joinIssues,
  flaggedRows,
  getPosition,
  getWidth,
  getSourceColor,
}: TimelineProps) {
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

      {rows.map((r, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 6 }}>
            <strong>
              {r.source || "default"} / {r.entity_id}
            </strong>
            <span style={{ marginLeft: 10, color: "#64748b", fontSize: 13 }}>
              {r.valid_from} → {r.valid_to}
            </span>
          </div>

          <div
            style={{
              height: 22,
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
                border: flaggedRows.has(i) ? "3px solid #ef4444" : "none",
                boxSizing: "border-box",
                borderRadius: 999,
                zIndex: 1,
              }}
            />

            {overlapMarkers
              .filter(
                (o) =>
                  String(o.entity_id) === String(r.entity_id) &&
                  o.source === r.source
              )
              .map((o, k) => (
                <div
                  key={`overlap-${k}`}
                  title={o.message}
                  style={{
                    position: "absolute",
                    left: `${getPosition(o.from)}%`,
                    width: `${getWidth(o.from, o.to)}%`,
                    height: "100%",
                    background: "#ef4444",
                    opacity: 0.75,
                    borderRadius: 999,
                    zIndex: 2,
                  }}
                />
              ))}

            {gaps
              .filter((g) => g.entity_id === r.entity_id)
              .map((g, j) => (
                <div
                  key={`gap-${j}`}
                  title={`GAP: ${g.from} → ${g.to}`}
                  style={{
                    position: "absolute",
                    left: `${getPosition(g.from)}%`,
                    width: `${getWidth(g.from, g.to)}%`,
                    height: "100%",
                    background: "#f59e0b",
                    opacity: 0.9,
                  }}
                />
              ))}

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
                    zIndex: 3,
                  }}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}