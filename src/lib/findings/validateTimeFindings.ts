import type { TargetFinding } from "@/lib/types";

export function detectInvalidIntervals(
  rows: any[],
  validFromCol: string,
  validToCol: string,
): TargetFinding[] {
  const findings: TargetFinding[] = [];

  for (const row of rows) {
    const from = new Date(row[validFromCol]);
    const to = new Date(row[validToCol]);

    if (!row[validFromCol] || !row[validToCol]) continue;

    if (from >= to) {
      findings.push({
        id: "invalid-interval",
        title: "Invalid valid-time interval detected",
        severity: "high",
        evidence: [
          `from: ${row[validFromCol]} → to: ${row[validToCol]} (not valid)`,
        ],
        recommendation:
          "Ensure valid_from < valid_to for all records.",
      });
    }
  }

  return findings;
}