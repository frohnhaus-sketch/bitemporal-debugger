import type { SourcePatternResult } from "./sourcePatterns";

export type RelationshipAnalysis = {
  relationship: string;
  challenges: string[];
  recommendation: string;
};

export function analyzeSourceRelationship(
  sourceA: SourcePatternResult,
  sourceB: SourcePatternResult
): RelationshipAnalysis {
  const pair = `${sourceA.pattern}|${sourceB.pattern}`;

  switch (pair) {
    case "STATE_SOURCE|STATE_SOURCE":
      return {
        relationship: "State Source ↔ State Source",
        challenges: [
          "Temporal join stability",
          "Historical overlap validation",
          "SCD2 consistency",
        ],
        recommendation:
          "Use standard temporal joins and validate overlapping history.",
      };

    case "STATE_SOURCE|EVENT_SOURCE":
    case "EVENT_SOURCE|STATE_SOURCE":
      return {
        relationship: "State Source ↔ Event Source",
        challenges: [
          "Join ambiguity risk",
          "Event prioritization",
          "Snapshot consistency",
        ],
        recommendation:
          "Consider event-to-state modeling patterns and validate reporting snapshots.",
      };

    case "EVENT_SOURCE|EVENT_SOURCE":
      return {
        relationship: "Event Source ↔ Event Source",
        challenges: [
          "Event correlation",
          "Duplicate business events",
          "Sequence alignment",
        ],
        recommendation:
          "Validate event ordering and business-event matching rules.",
      };

    case "RETROACTIVE_SOURCE|STATE_SOURCE":
    case "STATE_SOURCE|RETROACTIVE_SOURCE":
      return {
        relationship: "Retroactive Source ↔ State Source",
        challenges: [
          "Late-arriving corrections",
          "Snapshot reproducibility",
          "Visible-time assumptions",
        ],
        recommendation:
          "Preserve visible time and validate whether historical reports should use original or corrected knowledge.",
      };

    case "RETROACTIVE_SOURCE|EVENT_SOURCE":
    case "EVENT_SOURCE|RETROACTIVE_SOURCE":
      return {
        relationship: "Retroactive Source ↔ Event Source",
        challenges: [
          "Late-arriving business events",
          "Event ordering",
          "Temporal join instability",
        ],
        recommendation:
          "Validate event visibility and define how late-arriving events should affect historical snapshots.",
      };

    default:
      return {
        relationship: "Mixed Historical Sources",
        challenges: ["Source behavior mismatch", "Temporal complexity"],
        recommendation:
          "Review source behavior and temporal modeling assumptions.",
      };
  }
}