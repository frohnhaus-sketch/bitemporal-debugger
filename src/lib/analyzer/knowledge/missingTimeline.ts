import type { KnowledgeDefinition } from "./types";

export const missingTimelineKnowledge: KnowledgeDefinition = {
  id: "timeline-has-silent-missing-periods",
  severity: "high",
  title: "Timeline has silent missing periods",
  businessImpact:
    "Entities can disappear from historical reports even though they should exist.",
  recommendation:
    "Review missing intervals and distinguish genuine inactivity from missing data.",
  evidence: [
    {
      id: "business_key_detected",
      weight: 10,
      reason: "The table has an entity or business key.",
    },
    {
      id: "valid_time_detected",
      weight: 10,
      reason: "The table has valid-time intervals.",
    },
    {
      id: "snapshot_detected",
      weight: 10,
      reason: "The table contains snapshot or reporting periods.",
    },
    {
      id: "coverage_problem",
      weight: 30,
      reason: "Rules detected missing or incomplete historical coverage.",
    },
    {
      id: "valid_time_gaps",
      weight: 25,
      reason:
        "There are gaps between valid-time intervals for at least one entity.",
    },
    {
      id: "snapshot_coverage_gaps",
      weight: 30,
      reason:
        "Expected snapshot periods are missing for at least one entity.",
    },
    {
      id: "snapshot_coverage_gap_detected",
      weight: 25,
      reason: "Snapshot coverage appears incomplete.",
    },
  ],
};