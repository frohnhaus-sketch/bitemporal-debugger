import type {
  TargetFinding,
  HistoricalSemantics,
  IntervalEndSemantics,
} from "@/lib/types";

import { parseDate } from "@/lib/utils/date";
import { groupRowsByKey } from "@/lib/utils/group";

export function detectInvalidIntervals(
  rows: any[],
  validFromColumn: string,
  validToColumn: string,
): TargetFinding[] {
  const invalidCount = rows.filter((row) => {
    const from = parseDate(row[validFromColumn]);
    const to = parseDate(row[validToColumn]);
    return from && to && from.getTime() > to.getTime();
  }).length;

  if (invalidCount === 0) return [];

  return [
    {
      id: "invalid-valid-time-intervals",
      title: "Invalid valid-time intervals detected",
      severity: "high",
      evidence: [
        `${invalidCount} row${invalidCount === 1 ? "" : "s"} have valid_from after valid_to.`,
      ],
      recommendation:
        "Fix interval boundaries before using the table for joins, snapshots or point-in-time reporting.",
    },
  ];
}

export function detectValidTimeOverlaps(
  rows: any[],
  keyColumn: string,
  validFromColumn: string,
  validToColumn: string,
  semantics: HistoricalSemantics,
): TargetFinding[] {
  const byKey = groupRowsByKey(rows, keyColumn);
  let overlapCount = 0;

  byKey.forEach((keyRows) => {
    const sorted = keyRows
      .map((row) => ({
        from: parseDate(row[validFromColumn]),
        to: parseDate(row[validToColumn]),
      }))
      .filter((interval) => interval.from !== null && interval.to !== null)
      .sort((a, b) => a.from!.getTime() - b.from!.getTime());

    for (let i = 1; i < sorted.length; i++) {
      if (
        intervalsOverlap(
          sorted[i - 1].from!,
          sorted[i - 1].to!,
          sorted[i].from!,
          sorted[i].to!,
          semantics.validIntervalEnd,
        )
      ) {
        overlapCount += 1;
      }
    }
  });

  if (overlapCount === 0) return [];

  return [
    {
      id: "valid-time-overlaps",
      title: "Valid-time overlaps detected",
      severity: "high",
      evidence: [
        `${overlapCount} overlapping interval pair${
          overlapCount === 1 ? "" : "s"
        } found.`,
      ],
      assumptions: [
        semantics.validIntervalEnd === "exclusive"
          ? "valid_to is treated as exclusive. Touching intervals such as [2024-01-01, 2024-02-01) and [2024-02-01, 2024-03-01) do not overlap."
          : "valid_to is treated as inclusive. Touching intervals with the same boundary date are considered overlapping.",
        "Overlaps are checked within each detected business key.",
      ],
      recommendation:
        "Review whether overlapping intervals are expected. If not, apply winner selection, interval splitting or source correction logic.",
    },
  ];
}

export function detectValidTimeOverlapsWithinVisibleSlices(
  rows: any[],
  businessKey: string,
  validFromKey: string,
  validToKey: string,
  visibleFromKey: string,
  visibleToKey: string,
  semantics: HistoricalSemantics,
): TargetFinding[] {
  const groups = new Map<string, any[]>();

  for (const row of rows) {
    const key = row[businessKey];
    if (!key) continue;

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  const findings: TargetFinding[] = [];

  for (const [key, group] of groups.entries()) {
    const sorted = group
      .filter((r) => r[validFromKey] && r[validToKey])
      .sort(
        (a, b) =>
          new Date(a[validFromKey]).getTime() -
          new Date(b[validFromKey]).getTime(),
      );

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      const currentTo = new Date(current[validToKey]).getTime();
      const nextFrom = new Date(next[validFromKey]).getTime();

      if (currentTo > nextFrom) {
        findings.push({
          id: "valid-overlap-bitemporal",
          title: "Valid-time overlap within visible slice detected",
          severity: "high",
          evidence: [
            `Entity ${key}`,
            `${current[validFromKey]} → ${current[validToKey]}`,
            `${next[validFromKey]} → ${next[validToKey]}`,
          ],
          recommendation:
            "Fix overlapping valid-time intervals within the same visible-time slice.",
        });
      }
    }
  }

  return findings;
}

export function detectValidTimeGaps(
  rows: any[],
  keyColumn: string,
  validFromColumn: string,
  validToColumn: string,
  semantics: HistoricalSemantics,
): TargetFinding[] {
  const byKey = groupRowsByKey(rows, keyColumn);
  let gapCount = 0;

  byKey.forEach((keyRows) => {
    const sorted = keyRows
      .map((row) => ({
        from: parseDate(row[validFromColumn]),
        to: parseDate(row[validToColumn]),
      }))
      .filter((interval) => interval.from !== null && interval.to !== null)
      .sort((a, b) => a.from!.getTime() - b.from!.getTime());

    for (let i = 1; i < sorted.length; i++) {
      if (
        hasIntervalGap(
          sorted[i - 1].to!,
          sorted[i].from!,
          semantics.validIntervalEnd,
        )
      ) {
        gapCount += 1;
      }
    }
  });

  if (gapCount === 0) return [];

  return [
    {
      id: "valid-time-gaps",
      title: "Valid-time gaps detected",
      severity: "medium",
      evidence: [
        `${gapCount} gap${gapCount === 1 ? "" : "s"} between intervals found.`,
      ],
      assumptions: [
        semantics.validIntervalEnd === "exclusive"
          ? "valid_to is treated as exclusive. Intervals are continuous when valid_to equals the next valid_from."
          : "valid_to is treated as inclusive. Intervals are continuous when the next valid_from is the next calendar day.",
      ],
      recommendation:
        "Check whether gaps are expected. For continuous state histories, gaps may indicate missing source records or incomplete dimension coverage.",
    },
  ];
}

function intervalsOverlap(
  leftFrom: Date,
  leftTo: Date,
  rightFrom: Date,
  rightTo: Date,
  intervalEnd: IntervalEndSemantics,
) {
  if (intervalEnd === "exclusive") {
    return (
      leftFrom.getTime() < rightTo.getTime() &&
      rightFrom.getTime() < leftTo.getTime()
    );
  }

  return (
    leftFrom.getTime() <= rightTo.getTime() &&
    rightFrom.getTime() <= leftTo.getTime()
  );
}

function hasIntervalGap(
  previousTo: Date,
  nextFrom: Date,
  intervalEnd: IntervalEndSemantics,
) {
  if (intervalEnd === "exclusive") {
    return previousTo.getTime() < nextFrom.getTime();
  }

  const nextAllowed = new Date(previousTo);
  nextAllowed.setDate(nextAllowed.getDate() + 1);

  return nextAllowed.getTime() < nextFrom.getTime();
}

function detectInvalidVisibleIntervals(
  rows: any[],
  visibleFromColumn: string,
  visibleToColumn: string,
): TargetFinding[] {
  const invalidCount = rows.filter((row) => {
    const from = parseDate(row[visibleFromColumn]);
    const to = parseDate(row[visibleToColumn]);
    return from && to && from.getTime() > to.getTime();
  }).length;

  if (invalidCount === 0) return [];

  return [
    {
      id: "invalid-visible-time-intervals",
      title: "Invalid visible-time intervals detected",
      severity: "high",
      evidence: [
        `${invalidCount} row${invalidCount === 1 ? "" : "s"} have visible_from after visible_to.`,
      ],
      recommendation:
        "Fix visible-time boundaries before relying on auditability or reproducible snapshot behavior.",
    },
  ];
}