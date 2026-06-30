import type { TargetFinding } from "@/lib/types";
import { groupRowsByKey } from "@/lib/utils/group";
import { formatDate, nextMonthEnd, sameDay, parseDate } from "@/lib/utils/date";

export function detectMonthlySnapshotGaps(
  rows: any[],
  keyColumn: string,
  snapshotColumn: string,
): TargetFinding[] {
  const byKey = groupRowsByKey(rows, keyColumn);
  let missingCount = 0;
  const examples: string[] = [];

  byKey.forEach((keyRows, key) => {
    const dates = Array.from(
      new Set(
        keyRows
          .map((row) => parseDate(row[snapshotColumn]))
          .filter((date): date is Date => date !== null)
          .map((date) => formatDate(date)),
      ),
    )
      .map((date) => new Date(`${date}T00:00:00`))
      .sort((a, b) => a.getTime() - b.getTime());

    for (let i = 1; i < dates.length; i++) {
      const expectedNext = nextMonthEnd(dates[i - 1]);

      if (!sameDay(expectedNext, dates[i])) {
        missingCount += 1;

        if (examples.length < 3) {
          examples.push(
            `${key}: expected ${formatDate(expectedNext)} before ${formatDate(dates[i])}`,
          );
        }
      }
    }
  });

  if (missingCount === 0) return [];

  return [
    {
      id: "monthly-snapshot-gap",
      title: "Monthly snapshot coverage gap detected",
      severity: "high",
      evidence: [
        `${missingCount} missing monthly snapshot step${
          missingCount === 1 ? "" : "s"
        } detected within a business key timeline.`,
        `Examples: ${examples.join("; ")}.`,
      ],
      recommendation:
        "Check whether the missing snapshot month should be present. If the fact or dimension is required for every month-end snapshot, explicitly mark the gap, complete the history or use a controlled unknown member.",
    },
  ];
}

export function detectMissingSnapshotCoverage(
  rows: any[],
  keyColumn: string,
  snapshotColumn: string,
): TargetFinding[] {
  const snapshots = new Set(
    rows.map((row) => String(row[snapshotColumn] ?? "")),
  );
  const byKey = groupRowsByKey(rows, keyColumn);
  let missingCoverageCount = 0;

  byKey.forEach((keyRows) => {
    const keySnapshots = new Set(
      keyRows.map((row) => String(row[snapshotColumn] ?? "")),
    );

    snapshots.forEach((snapshot) => {
      if (!keySnapshots.has(snapshot)) missingCoverageCount += 1;
    });
  });

  if (snapshots.size <= 1 || missingCoverageCount === 0) return [];

  return [
    {
      id: "missing-snapshot-coverage",
      title: "Potential missing snapshot coverage detected",
      severity: "medium",
      evidence: [
        `${missingCoverageCount} business-key / snapshot-date combination${
          missingCoverageCount === 1 ? "" : "s"
        } missing from the pasted sample.`,
      ],
      recommendation:
        "Check whether every required business key should appear in every reporting snapshot. If not, document the expected sparsity.",
    },
  ];
}

export function detectSnapshotDuplicates(
  rows: any[],
  businessKey: string,
  snapshotDate: string,
): TargetFinding[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const key = `${row[businessKey]}||${row[snapshotDate]}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const duplicates = Array.from(counts.entries()).filter(
    ([, count]) => count > 1,
  );

  if (duplicates.length === 0) return [];

  return [
    {
      id: "snapshot-duplicates",
      title: "Duplicate snapshot records detected",
      severity: "medium",
      evidence: [
        `${duplicates.length} duplicate business-key / snapshot-date combinations found.`,
      ],
      recommendation:
        "Ensure snapshot output is deduplicated at business_key + snapshot_date grain.",
    },
  ];
}