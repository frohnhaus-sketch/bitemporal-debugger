import type {
  TargetFinding,
  HistoricalSemantics,
  IntervalEndSemantics,
} from "@/lib/types";

import { parseDate } from "@/lib/utils/date";
import { groupRowsByKey } from "@/lib/utils/group";
import type { RuleResult } from "@/lib/analyzer/rules/types";
import { emptyRuleResult } from "@/lib/analyzer/rules/ruleResult";

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
): RuleResult {
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

  if (overlapCount === 0) {
    return emptyRuleResult({
      validTimeOverlapCount: 0,
      hasTemporalAmbiguity: false,
      hasCriticalReproducibilityRisk: false,
    });
  }

  if (semantics.correctionMode === "bitemporal") {
    return {
      findings: [
        {
          id: "multiple-valid-time-versions-detected",
          title: "Multiple valid-time versions detected",
          severity: "low",
          evidence: [
            `${overlapCount} overlapping valid-time interval pair${
              overlapCount === 1 ? "" : "s"
            } found.`,
            "Because bitemporal mode is selected, valid-time overlap alone is not treated as a reproducibility error.",
            "The analyzer expects visible-time intervals to explain which version was known at which point in time.",
          ],
          assumptions: [
            semantics.validIntervalEnd === "exclusive"
              ? "valid_to is treated as exclusive. Touching intervals such as [2024-01-01, 2024-02-01) and [2024-02-01, 2024-03-01) do not overlap."
              : "valid_to is treated as inclusive. Touching intervals with the same boundary date are considered overlapping.",
            "Overlaps are checked within each detected business key.",
            "In bitemporal mode, multiple valid-time versions are only a problem when they are simultaneously visible.",
          ],
          recommendation:
            "Verify that visible-time intervals separate historical versions cleanly for the same business key and valid-time period.",
        },
      ],
      facts: {
        validTimeOverlapCount: overlapCount,
        hasTemporalAmbiguity: false,
        hasCriticalReproducibilityRisk: false,
      },
    };
  }

  return {
    findings: [
      {
        id: "valid-time-overlaps",
        title: "Valid-time overlaps detected",
        severity: "high",
        evidence: [
          `${overlapCount} overlapping interval pair${
            overlapCount === 1 ? "" : "s"
          } found.`,
          "In valid-time mode, overlapping intervals prevent deterministic reconstruction of historical state.",
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
    ],
    facts: {
      validTimeOverlapCount: overlapCount,
      hasTemporalAmbiguity: true,
      hasCriticalReproducibilityRisk: true,
    },
  };
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

  let overlapCount = 0;
  const examples: string[] = [];

  for (const [key, group] of groups.entries()) {
    const comparableRows = group
      .map((row) => ({
        row,
        validFrom: parseDate(row[validFromKey]),
        validTo: parseDate(row[validToKey]),
        visibleFrom: parseDate(row[visibleFromKey]),
        visibleTo: parseDate(row[visibleToKey]),
      }))
      .filter(
        (item) =>
          item.validFrom && item.validTo && item.visibleFrom && item.visibleTo,
      )
      .sort(
        (a, b) =>
          a.visibleFrom!.getTime() - b.visibleFrom!.getTime() ||
          a.validFrom!.getTime() - b.validFrom!.getTime(),
      );

    for (let i = 0; i < comparableRows.length; i++) {
      for (let j = i + 1; j < comparableRows.length; j++) {
        const left = comparableRows[i];
        const right = comparableRows[j];

        const validOverlaps = intervalsOverlap(
          left.validFrom!,
          left.validTo!,
          right.validFrom!,
          right.validTo!,
          semantics.validIntervalEnd,
        );

        const visibleOverlaps = intervalsOverlap(
          left.visibleFrom!,
          left.visibleTo!,
          right.visibleFrom!,
          right.visibleTo!,
          semantics.visibleIntervalEnd,
        );

        if (!validOverlaps || !visibleOverlaps) continue;

        overlapCount += 1;

        if (examples.length < 6) {
          examples.push(
            `Entity ${key}: valid ${formatDate(left.validFrom)} → ${formatDate(
              left.validTo,
            )} and ${formatDate(right.validFrom)} → ${formatDate(
              right.validTo,
            )} are simultaneously visible ${formatDate(
              left.visibleFrom,
            )} → ${formatDate(left.visibleTo)} and ${formatDate(
              right.visibleFrom,
            )} → ${formatDate(right.visibleTo)}.`,
          );
        }
      }
    }
  }

  if (overlapCount === 0) return [];

  return [
    {
      id: "bitemporal-visible-time-overlaps",
      title: "Bitemporal overlap conflict detected",
      severity: "high",
      evidence: [
        `${overlapCount} pair${overlapCount === 1 ? "" : "s"} overlap in both valid time and visible time.`,
        ...examples,
      ],
      assumptions: [
        semantics.validIntervalEnd === "exclusive"
          ? "valid_to is treated as exclusive."
          : "valid_to is treated as inclusive.",
        semantics.visibleIntervalEnd === "exclusive"
          ? "visible_to is treated as exclusive."
          : "visible_to is treated as inclusive.",
        "In bitemporal mode, valid-time versions are only deterministic when visible-time intervals decide which version was known.",
      ],
      recommendation:
        "Fix visible-time boundaries or add deterministic correction logic so only one version is visible for the same business key and valid-time period.",
    },
  ];
}

export function detectValidTimeGaps(
  rows: any[],
  keyColumn: string,
  validFromColumn: string,
  validToColumn: string,
  semantics: HistoricalSemantics,
): RuleResult {
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
      const previousTo = sorted[i - 1].to!;
      const currentFrom = sorted[i].from!;

      if (previousTo.getTime() < currentFrom.getTime()) {
        gapCount += 1;
      }
    }
  });

  if (gapCount === 0) {
    return emptyRuleResult({
      validTimeGapCount: 0,
      hasCoverageProblem: false,
    });
  }

  if (semantics.correctionMode === "bitemporal") {
    return {
      findings: [
        {
          id: "non-continuous-valid-time-history",
          title: "Non-continuous valid-time history detected",
          severity: "low",
          evidence: [
            `${gapCount} valid-time gap${gapCount === 1 ? "" : "s"} found.`,
            "In bitemporal mode, valid-time gaps are not automatically reproducibility errors.",
            "A gap may be valid if the business entity did not exist, was inactive, or was intentionally not covered during that period.",
          ],
          assumptions: [
            "Gaps are checked within each detected business key.",
            "The analyzer treats a later valid_from after the previous valid_to as a gap.",
            "In bitemporal mode, the analyzer does not assume that every business key must have continuous valid-time coverage.",
          ],
          recommendation:
            "Verify whether the missing valid-time periods are expected business inactivity or unintended missing history.",
        },
      ],
      facts: {
        validTimeGapCount: gapCount,
        hasCoverageProblem: false,
      },
    };
  }

  return {
    findings: [
      {
        id: "valid-time-gaps",
        title: "Valid-time gaps detected",
        severity: "medium",
        evidence: [
          `${gapCount} valid-time gap${gapCount === 1 ? "" : "s"} found.`,
          "In valid-time mode, gaps can cause historical reporting periods to silently disappear.",
        ],
        assumptions: [
          "Gaps are checked within each detected business key.",
          "The analyzer treats a later valid_from after the previous valid_to as a gap.",
        ],
        recommendation:
          "Check whether the gaps represent real business inactivity. If not, add missing intervals or define explicit gap-handling logic.",
      },
    ],
    facts: {
      validTimeGapCount: gapCount,
      hasCoverageProblem: true,
    },
  };
}

export function detectInvalidVisibleIntervals(
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

function formatDate(date: Date | null) {
  if (!date) return "unknown";
  return date.toISOString().slice(0, 10);
}
