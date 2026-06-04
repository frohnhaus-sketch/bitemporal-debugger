import type {
  AggregatedJoinabilityIssue,
  BitemporalRow,
  OverlapIssue,
  TemporalIssue,
} from "@/lib/types";
import { track } from "@/lib/analytics";

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
  const [year, month, day] = date.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day);
  return new Date(utc + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function normalizeGapStart(from: string, rowEndDates: string[]) {
  if (rowEndDates.includes(from)) {
    return addOneDay(from);
  }

  return from;
}

function getSelectedIssueEntityId(
  selectedTemporalIssue: TemporalIssue | null,
  selectedIssue: AggregatedJoinabilityIssue | null,
  highlightedEntityId: string | null
) {
  if (selectedTemporalIssue?.entity_id !== undefined) {
    return String(selectedTemporalIssue.entity_id);
  }

  if (selectedIssue?.entity_id !== undefined) {
    return String(selectedIssue.entity_id);
  }

  if (selectedIssue?.entityIds?.length) {
    return String(selectedIssue.entityIds[0]);
  }

  if (highlightedEntityId) {
    return String(highlightedEntityId);
  }

  return null;
}

function getFocusLabel(
  selectedTemporalIssue: TemporalIssue | null,
  selectedIssue: AggregatedJoinabilityIssue | null,
  highlightedEntityId: string | null
) {
  if (selectedTemporalIssue) {
    return {
      title: selectedTemporalIssue.title ?? selectedTemporalIssue.type,
      entity: selectedTemporalIssue.entity_id,
      source: selectedTemporalIssue.source,
      from: selectedTemporalIssue.from,
      to: selectedTemporalIssue.to,
    };
  }

  if (selectedIssue) {
    return {
      title: selectedIssue.type,
      entity: selectedIssue.isAggregated
        ? `${selectedIssue.count} entities`
        : selectedIssue.entity_id,
      source: selectedIssue.source,
      from: selectedIssue.valid_from,
      to: selectedIssue.valid_to,
    };
  }

  if (highlightedEntityId) {
    return {
      title: "Highlighted entity",
      entity: highlightedEntityId,
      source: null,
      from: null,
      to: null,
    };
  }

  return null;
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

  const focusedEntityId = getSelectedIssueEntityId(
    selectedTemporalIssue,
    selectedIssue,
    highlightedEntityId
  );

  const focusLabel = getFocusLabel(
    selectedTemporalIssue,
    selectedIssue,
    highlightedEntityId
  );

  const timelineRows = focusedEntityId
    ? rows.filter((row) => String(row.entity_id) === focusedEntityId)
    : rows;

  const visibleRows = timelineRows.slice(0, MAX_TIMELINE_ROWS);

  const groupedRows = visibleRows.reduce<Record<string, BitemporalRow[]>>(
    (acc, row) => {
      const key = String(row.entity_id ?? "unknown");
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    },
    {}
  );

  function getEntitySourceGaps(entityId: string, source: string) {
    return gaps.filter(
      (gap) => String(gap.entity_id) === String(entityId) && gap.source === source
    );
  }

  function getEntitySourceOverlaps(entityId: string, source: string) {
    return overlapMarkers.filter(
      (overlap) =>
        String(overlap.entity_id) === String(entityId) &&
        overlap.source === source
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
          issue.originalIssue?.kind === "join" ? issue.originalIssue.issue : null;

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
      style={{
        background: "#ffffff",
        color: "#0f172a",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 6px", fontSize: 20 }}>
            Valid-Time Evidence
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            Valid-time timeline. Bitemporal findings are highlighted as investigation markers and may involve visible-time conditions.
          </p>
        </div>

        {focusLabel && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onSelectTemporalIssue(null);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#334155",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Clear investigation focus
          </button>
        )}
      </div>

      {focusLabel && (
        <div
          onClick={(event) => event.stopPropagation()}
          style={{
            marginBottom: 18,
            padding: 14,
            borderRadius: 12,
            background: "#eff6ff",
            border: "1px solid #60a5fa",
            color: "#1e3a8a",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Focused investigation
          </div>

          <div style={{ fontSize: 15, fontWeight: 800 }}>
            {focusLabel.title}
          </div>

          <div style={{ marginTop: 4, fontSize: 13 }}>
            Entity {focusLabel.entity}
            {focusLabel.source ? ` · ${focusLabel.source}` : ""}
            {focusLabel.from && focusLabel.to
              ? ` · ${focusLabel.from} → ${focusLabel.to}`
              : ""}
          </div>
        </div>
      )}

      <div
        style={{
          marginBottom: 16,
          fontSize: 12,
          color: "#64748b",
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: "#d1d5db" }}>■</span> No data{" "}
        <span style={{ margin: "0 8px", color: "#cbd5e1" }}>·</span>
        <span style={{ color: "#64748b" }}>■</span> Valid interval{" "}
        <span style={{ margin: "0 8px", color: "#cbd5e1" }}>·</span>
        <span style={{ color: "#f59e0b" }}>■</span> Gap{" "}
        <span style={{ margin: "0 8px", color: "#cbd5e1" }}>·</span>
        <span style={{ color: "#ef4444" }}>■</span> Overlap{" "}
        <span style={{ margin: "0 8px", color: "#cbd5e1" }}>·</span>
        Dashed border = source alignment finding
      </div>

      {Object.entries(groupedRows).map(([entityId, entityRows]) => {
        const sources = Array.from(
          new Set(entityRows.map((row) => row.source).filter(Boolean))
        );

        return (
          <div key={entityId} style={{ marginTop: 20, marginBottom: 28 }}>
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

            {entityRows.map((row, index) => {
              const isSelectedTemporalIssueRow =
                selectedTemporalIssue &&
                String(selectedTemporalIssue.entity_id) ===
                  String(row.entity_id) &&
                selectedTemporalIssue.source === row.source &&
                selectedTemporalIssue.from === row.valid_from &&
                selectedTemporalIssue.to === row.valid_to;

              const isSelectedIssueRow =
                isSelectedTemporalIssueRow ||
                (selectedIssue &&
                  String(selectedIssue.entity_id) === String(row.entity_id) &&
                  selectedIssue.source === row.source &&
                  selectedIssue.valid_from === row.valid_from &&
                  selectedIssue.valid_to === row.valid_to);

              return (
                <div
                  key={`${row.source}-${index}`}
                  style={{
                    marginBottom: 12,
                    opacity:
                      (selectedTemporalIssue || selectedIssue) &&
                      !isSelectedIssueRow
                        ? 0.5
                        : 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ marginBottom: 2, fontSize: 12 }}>
                    <strong>
                      {row.source || "default"} / {row.entity_id}
                    </strong>

                    <span
                      style={{
                        marginLeft: 10,
                        color: "#64748b",
                        fontSize: 11,
                      }}
                    >
                      {row.valid_from} → {row.valid_to}
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
                        left: `${getPosition(row.valid_from)}%`,
                        width: `${getWidth(row.valid_from, row.valid_to)}%`,
                        height: "100%",
                        background: "#64748b",
                        borderRadius: 999,
                        boxShadow: isSelectedIssueRow
                          ? "0 0 0 3px rgba(59,130,246,0.45)"
                          : "none",
                      }}
                    />

                    {getEntityTemporalIssues(
                      String(row.entity_id),
                      row.source,
                      row
                    ).map((issue) => {
                      const isSelected = selectedTemporalIssue?.id === issue.id;

                      const matchingValidGap =
                        issue.type === "JOIN_GAP"
                          ? temporalIssues.find(
                              (gapIssue) =>
                                gapIssue.type === "VALID_GAP" &&
                                String(gapIssue.entity_id) ===
                                  String(issue.entity_id) &&
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
                          onClick={(event) => {
                            event.stopPropagation();
                          
                            track("timeline_issue_selected", {
                              type: issue.type,
                              entityId: issue.entity_id,
                              source: issue.source,
                              title: issue.title,
                            });
                          
                            onSelectTemporalIssue(issue);
                          }}
                          style={{
                            position: "absolute",
                            left: `${getPosition(displayFrom)}%`,
                            width: `${getWidth(displayFrom, displayTo)}%`,
                            height: "100%",
                            border:
                              issue.type === "JOIN_AMBIGUITY" ||
                              issue.type === "OVERLAP"
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
                  </div>
                </div>
              );
            })}

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
                    {sourceGaps.map((gap, gapIndex) => {
                      const rawFrom = gap.from ?? gap.valid_from;
                      const to = gap.to ?? gap.valid_to;
                      if (!rawFrom || !to) return null;

                      const rowEndDates = entityRows
                        .filter((row) => row.source === source)
                        .map((row) => row.valid_to);

                      const from = normalizeGapStart(rawFrom, rowEndDates);

                      const matchingIssue =
                        temporalIssues.find(
                          (issue) =>
                            issue.type === "VALID_GAP" &&
                            String(issue.entity_id) === String(gap.entity_id) &&
                            issue.source === source
                        ) ?? null;

                      const isSelected =
                        selectedTemporalIssue?.id === matchingIssue?.id;

                      return (
                        <div
                          key={gapIndex}
                          title={`Gap: no valid record exists between ${from} and ${to}`}
                          onClick={(event) => {
                            event.stopPropagation();
                          
                            track("timeline_gap_selected", {
                              entityId: gap.entity_id,
                              source,
                            });
                          
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
                            outline: isSelected
                              ? "2px solid #2563eb"
                              : "none",
                            outlineOffset: 2,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {sources.map((source) => {
              const overlaps = getEntitySourceOverlaps(
                entityId,
                String(source)
              );
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
                    {overlaps.map((overlap, overlapIndex) => {
                      const matchingIssue =
                        temporalIssues.find(
                          (issue) =>
                            issue.type === "OVERLAP" &&
                            String(issue.entity_id) ===
                              String(overlap.entity_id) &&
                            issue.source === source
                        ) ?? null;

                      const isSelected =
                        selectedTemporalIssue?.id === matchingIssue?.id;

                      return (
                        <div
                          key={overlapIndex}
                          title={
                            matchingIssue?.explanation
                              ? `${matchingIssue.title}: ${matchingIssue.explanation} (${overlap.from} → ${overlap.to})`
                              : `Overlap: multiple records overlap (${overlap.from} → ${overlap.to})`
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                          
                            track("timeline_overlap_selected", {
                              entityId: overlap.entity_id,
                              source,
                            });
                          
                            onSelectTemporalIssue(matchingIssue);
                          }}
                          style={{
                            position: "absolute",
                            left: `${getPosition(overlap.from)}%`,
                            width: `${getWidth(overlap.from, overlap.to)}%`,
                            height: "100%",
                            background: "#ef4444",
                            cursor: "pointer",
                            zIndex: 10,
                            outline: isSelected
                              ? "2px solid #2563eb"
                              : "none",
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

      {timelineRows.length > MAX_TIMELINE_ROWS && (
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
          Showing first {MAX_TIMELINE_ROWS} of {timelineRows.length} timeline rows
          to keep the view readable.
        </div>
      )}
    </div>
  );
}