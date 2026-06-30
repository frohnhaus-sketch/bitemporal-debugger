import type { TargetFinding } from "@/lib/types";

export function detectEventPrioritizationRisk(
  rows: any[],
): TargetFinding[] {
  const statusColumn = "prioritization_status";

  if (!rows.some((row) => row[statusColumn] !== undefined)) {
    return [];
  }

  const noisyRows = rows.filter((row) => {
    const value = String(row[statusColumn] ?? "")
      .trim()
      .toLowerCase();

    return [
      "operational_noise_kept",
      "technical_event_kept",
      "workflow_noise_kept",
      "duplicate_milestone",
      "raw_event_kept",
    ].includes(value);
  });

  if (noisyRows.length === 0) return [];

  return [
    {
      id: "event-prioritization-risk",
      title: "Event prioritization noise detected",
      severity: "medium",
      evidence: [
        `${noisyRows.length} row(s) contain non-business or noise events.`,
      ],
      recommendation:
        "Filter or collapse technical events before building analytical models.",
    },
  ];
}