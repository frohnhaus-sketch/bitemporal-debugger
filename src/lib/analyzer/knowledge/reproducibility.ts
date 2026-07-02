import type { KnowledgeDefinition } from "./types";

export const reproducibilityKnowledge: KnowledgeDefinition = {
  id: "historical-output-not-reproducible",

  severity: "critical",

  title: "Historical output is not reproducible",

  businessImpact:
    "Historical reports may change when rebuilt and no longer match previously published results.",

  recommendation:
    "Introduce explicit snapshot semantics or preserve correction history using visible time.",

  evidence: [
    {
      id: "snapshot_detected",
      weight: 20,
      reason: "The table contains a snapshot or reporting date column.",
    },
    {
      id: "visible_time_detected",
      weight: 15,
      reason: "The table preserves visible-time or system-time information.",
    },
    {
      id: "critical_reproducibility_risk",
      weight: 35,
      reason:
        "Rules detected that historical output may change when rebuilt later.",
    },
    {
      id: "coverage_problem",
      weight: 15,
      reason:
        "Some expected historical periods appear to be missing or uncovered.",
    },
    {
      id: "snapshot_coverage_gap",
      weight: 20,
      reason:
        "Snapshot coverage is incomplete for at least one expected reporting period.",
    },
  ],
};