import type { KnowledgeDefinition } from "./types";

export const conflictingHistoryKnowledge: KnowledgeDefinition = {
  id: "business-history-contains-conflicting-states",
  severity: "high",
  title: "Business history contains conflicting states",
  businessImpact:
    "Historical joins may duplicate rows or produce contradictory business states.",
  recommendation:
    "Ensure that at most one state is valid per business entity and time interval.",
  evidence: [
    {
      id: "business_key_detected",
      weight: 10,
      reason: "The table has an entity or business key.",
    },
    {
      id: "valid_time_detected",
      weight: 10,
      reason: "The table has valid-time interval columns.",
    },
    {
      id: "temporal_ambiguity",
      weight: 25,
      reason:
        "The temporal structure is ambiguous and may produce multiple valid states.",
    },
    {
      id: "duplicate_intervals",
      weight: 30,
      reason:
        "Duplicate intervals were detected for the same historical entity.",
    },
    {
      id: "valid_time_overlaps",
      weight: 35,
      reason:
        "Overlapping valid-time intervals were detected for the same entity.",
    },
    {
      id: "duplicate_snapshot_grain",
      weight: 20,
      reason: "Multiple rows exist for the same snapshot grain.",
    },
  ],
};