import type { TargetFinding } from "@/lib/types";
import type { RuleFacts } from "@/lib/analyzer/rules/types";

export function detectEventPrioritizationRisk(rows: any[]): {
  findings: TargetFinding[];
  facts: RuleFacts;
} {
  const statusColumn = "prioritization_status";

  if (!rows.some((row) => row[statusColumn] !== undefined)) {
    return {
      findings: [],
      facts: {
        hasEventPrioritizationRisk: false,
      },
    };
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

  if (noisyRows.length === 0) {
    return {
      findings: [],
      facts: {
        hasEventPrioritizationRisk: false,
      },
    };
  }

  return {
    findings: [
      {
        id: "event-prioritization-risk",
        title: "Event prioritization noise detected",
        severity: "medium",
        evidence: [
          `${noisyRows.length} row${noisyRows.length === 1 ? "" : "s"} contain non-business or noise events.`,
        ],
        recommendation:
          "Filter or collapse technical events before building analytical models.",
      },
    ],
    facts: {
      eventPrioritizationRiskCount: noisyRows.length,
      hasEventPrioritizationRisk: true,
      hasTemporalAmbiguity: true,
    },
  };
}