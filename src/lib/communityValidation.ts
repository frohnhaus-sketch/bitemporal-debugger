export const COMMUNITY_VALIDATION: Record<
  string,
  {
    priority: "High" | "Medium" | "Low";
    observedIn: string[];
    summary: string;
  }
> = {
  "Dimension Completion": {
    priority: "High",
    observedIn: [
      "Late Arriving Dimensions",
      "Missing Foreign Keys",
      "Inferred Members",
      "Historical Fact Construction",
    ],
    summary:
      "Dimension history does not fully cover fact history.",
  },

  "Snapshot Reproducibility": {
    priority: "High",
    observedIn: [
      "Historical Reporting",
      "Snapshot Rebuilds",
      "Audit Reporting",
      "Backfills",
    ],
    summary:
      "Historical reports must remain reproducible over time.",
  },

  "Historical Conformance": {
    priority: "High",
    observedIn: [
      "Multiple Source Systems",
      "Golden Record Discussions",
      "Historical Reconciliation",
    ],
    summary:
      "Multiple systems describe the same entity differently.",
  },

  "Historical Match Ambiguity": {
    priority: "High",
    observedIn: [
      "Multiple SCD2 Joins",
      "Temporal Joins",
      "Historized Dimensions",
    ],
    summary:
      "More than one historical match satisfies a join.",
  },

  "State ↔ Event Alignment": {
    priority: "Medium",
    observedIn: [
      "Event Attribution",
      "Snapshot Fact Construction",
      "Workflow Modeling",
    ],
    summary:
      "Events must map to exactly one historical state.",
  },
};  