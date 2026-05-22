import {
  closedDateIntervalsOverlap,
  halfOpenTimestampIntervalsOverlap,
} from "./dates";

import type { ValidationMode, OverlapIssue } from "./types";

export function detectDrift(rows: any[]) {
  const groupedBySource: Record<string, any[]> = {};

  rows.forEach((row) => {
    const src = row.source || "default";

    if (!groupedBySource[src]) {
      groupedBySource[src] = [];
    }

    groupedBySource[src].push(row);
  });

  const driftIssues: string[] = [];
  const sources = Object.keys(groupedBySource);

  if (sources.length < 2) return driftIssues;

  const [s1, s2] = sources;

  const rows1 = groupedBySource[s1];
  const rows2 = groupedBySource[s2];

  rows1.forEach((a) => {
    rows2.forEach((b) => {
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

      if (!(validOverlap && visibleOverlap)) return;

      const t1 = new Date(a.visible_from).getTime();
      const t2 = new Date(b.visible_from).getTime();

      const driftMs = Math.abs(t1 - t2);

      if (driftMs > 1000) {
        driftIssues.push(
          `DRIFT (${a.entity_id}): ${s1} vs ${s2} = ${driftMs} ms`
        );
      }
    });
  });

  return driftIssues;
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