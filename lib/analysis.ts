import {
  closedDateIntervalsOverlap,
  halfOpenTimestampIntervalsOverlap,
} from "./dates";
import type { BitemporalRow, ValidationMode, OverlapIssue, DriftSummary } from "./types";

export function detectDrift(rows: BitemporalRow[]): DriftSummary[] {
  const byEntity = new Map<string, BitemporalRow[]>();

  rows.forEach((row) => {
    const key = String(row.entity_id);
    byEntity.set(key, [...(byEntity.get(key) || []), row]);
  });

  const driftGroups = new Map<string, DriftSummary>();

  byEntity.forEach((entityRows, entityId) => {
    const sources = Array.from(new Set(entityRows.map((r) => r.source)));

    if (sources.length !== 2) return;

    const [sourceA, sourceB] = sources;

    const rowsA = entityRows.filter((r) => r.source === sourceA);
    const rowsB = entityRows.filter((r) => r.source === sourceB);

    const firstA = rowsA
      .map((r) => new Date(r.visible_from).getTime())
      .sort((a, b) => a - b)[0];

    const firstB = rowsB
      .map((r) => new Date(r.visible_from).getTime())
      .sort((a, b) => a - b)[0];

    if (!firstA || !firstB) return;

    const lagMs = firstB - firstA;

    if (lagMs === 0) return;

    const key = `${sourceA}|${sourceB}|${lagMs}`;

    const existing = driftGroups.get(key);

    if (existing) {
      existing.entityCount += 1;
      existing.entityIds.push(entityId);
    } else {
      driftGroups.set(key, {
        sourceA,
        sourceB,
        lagMs,
        entityCount: 1,
        entityIds: [entityId],
        severity: "info",
      });
    }
  });

  return Array.from(driftGroups.values()).sort(
    (a, b) => b.entityCount - a.entityCount
  );
}

export function detectOverlaps(
  rows: any[],
  mode: ValidationMode = "monotemporal"
) {
  const issues: string[] = [];

  rows.forEach((a, i) => {
    rows.forEach((b, j) => {
      if (i >= j) return;
      if (a.source !== b.source) return;
      if (String(a.entity_id) !== String(b.entity_id)) return;

      const validOverlap = closedDateIntervalsOverlap(
        a.valid_from,
        a.valid_to,
        b.valid_from,
        b.valid_to
      );

      const visibleOverlap = halfOpenTimestampIntervalsOverlap(
        a.visible_from,
        a.visible_to ?? "",
        b.visible_from,
        b.visible_to ?? ""
      );

      const isOverlap =
        mode === "monotemporal"
          ? validOverlap
          : validOverlap && visibleOverlap;

      if (isOverlap) {
        issues.push(
          `${mode === "bitemporal" ? "BITEMPORAL " : ""}OVERLAP (${a.source}/${a.entity_id}): ${a.valid_from}-${a.valid_to}`
        );
      }
    });
  });

  return issues;
}

export function detectFlaggedOverlapRows(
  rows: any[],
  validationMode: ValidationMode = "monotemporal"
) {
  const flagged = new Set<number>();

  rows.forEach((a, i) => {
    rows.forEach((b, j) => {
      if (i === j) return;
      if (a.source !== b.source) return;
      if (String(a.entity_id) !== String(b.entity_id)) return;

      const validOverlap = closedDateIntervalsOverlap(
        a.valid_from,
        a.valid_to,
        b.valid_from,
        b.valid_to
      );

      const visibleOverlap = halfOpenTimestampIntervalsOverlap(
        a.visible_from,
        a.visible_to ?? "",
        b.visible_from,
        b.visible_to ?? ""
      );

      const isOverlap =
        validationMode === "monotemporal"
          ? validOverlap
          : validOverlap && visibleOverlap;

      if (isOverlap) {
        flagged.add(i);
      }
    });
  });

  return flagged;
}

export function detectGaps(rows: any[]) {
  const gaps: any[] = [];

  const groups: Record<string, any[]> = {};

  rows.forEach((row) => {
    const key = `${row.source || "default"}|${row.entity_id}`;

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(row);
  });

  Object.values(groups).forEach((groupRows) => {
    const sorted = [...groupRows].sort(
      (a, b) =>
        new Date(a.valid_from).getTime() -
        new Date(b.valid_from).getTime()
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      const currentTo = new Date(current.valid_to);
      const nextFrom = new Date(next.valid_from);

      const expectedNextDay = new Date(currentTo);
      expectedNextDay.setDate(expectedNextDay.getDate() + 1);

      if (nextFrom.getTime() > expectedNextDay.getTime()) {
        gaps.push({
          source: current.source,
          entity_id: current.entity_id,
          from: expectedNextDay.toISOString().slice(0, 10),
          to: new Date(nextFrom.getTime() - 86400000)
            .toISOString()
            .slice(0, 10),
        });
      }
    }
  });

  return gaps;
}

export function detectOverlapMarkers(
  rows: any[],
  mode: ValidationMode = "monotemporal"
) {
  const overlaps: OverlapIssue[] = [];

  rows.forEach((a, i) => {
    rows.forEach((b, j) => {
      if (i >= j) return;
      if (a.source !== b.source) return;
      if (String(a.entity_id) !== String(b.entity_id)) return;

      const validOverlap = closedDateIntervalsOverlap(
        a.valid_from,
        a.valid_to,
        b.valid_from,
        b.valid_to
      );

      const visibleOverlap = halfOpenTimestampIntervalsOverlap(
        a.visible_from,
        a.visible_to ?? "",
        b.visible_from,
        b.visible_to ?? ""
      );

      const isOverlap =
        mode === "monotemporal"
          ? validOverlap
          : validOverlap && visibleOverlap;

      if (!isOverlap) return;

      const from =
        new Date(a.valid_from) > new Date(b.valid_from)
          ? a.valid_from
          : b.valid_from;

      const to =
        new Date(a.valid_to) < new Date(b.valid_to)
          ? a.valid_to
          : b.valid_to;

      overlaps.push({
        source: a.source,
        entity_id: a.entity_id,
        from,
        to,
        message:
          mode === "bitemporal"
            ? `BITEMPORAL OVERLAP: records overlap in valid and visible time`
            : `OVERLAP: records overlap in valid time`,
      });
    });
  });

  return overlaps;
}