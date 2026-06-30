import type { TargetFinding } from "@/lib/types";

function isMissingValue(value: any): boolean {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    String(value).toLowerCase() === "null" ||
    String(value).toLowerCase() === "none"
  );
}

export function detectMissingDimensionValues(
  rows: any[],
  dimensionColumns: string[],
): TargetFinding[] {
  const findings: TargetFinding[] = [];

  for (const column of dimensionColumns) {
    const missingRows = rows.filter((row) =>
      isMissingValue(row[column]),
    );

    if (missingRows.length === 0) continue;

    findings.push({
      id: `missing-dimension-${column}`,
      title: `Missing dimension values in ${column}`,
      severity: "high",
      evidence: [
        `${missingRows.length} row(s) missing value for ${column}.`,
      ],
      recommendation:
        "Use Dimension Completion, Unknown Member handling or fix upstream enrichment logic.",
    });
  }

  return findings;
}