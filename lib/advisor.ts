export type ReportingGoal =
  | "CURRENT_STATE"
  | "POINT_IN_TIME"
  | "SNAPSHOT"
  | "EVENT"
  | "AUDIT";

export type SourceType =
  | "State Records"
  | "Events"
  | "Change Log / CDC"
  | "Reference Data"
  | "Business Relationships";

export type YesNoUnknown = "YES" | "NO" | "UNKNOWN";

export type DimensionNeed = "NO" | "SCD1" | "SCD2" | "BITEMPORAL";

export type AdvisorAnswers = {
  reportingGoal: ReportingGoal;
  sourceTypes: SourceType[];
  historyCorrected: YesNoUnknown;
  multipleSystems: "YES" | "NO";
  changingRelationships: "YES" | "NO";
  historizedDimensions: DimensionNeed;
};

export type AdvisorBlueprint = {
  recommendation: string;
  architecture: string[];
  operations: string[];
  patterns: string[];
  validationChecklist: string[];
  notebookStructure: string[];
  risks: string[];
  validationChecks: string[];
};

function unique(items: string[]) {
  return Array.from(new Set(items));
}

export function generateAdvisorBlueprint(
  answers: AdvisorAnswers
): AdvisorBlueprint {
  const architecture: string[] = [];
  const operations: string[] = [];
  const patterns: string[] = [];
  const validationChecklist: string[] = [];
  const notebookStructure: string[] = [
    "01_load_sources",
    "02_standardize_history_columns",
    "03_classify_source_behavior",
    "04_apply_modeling_operations",
    "05_build_historical_product",
    "06_validate_output",
  ];
  const risks: string[] = [];
  const validationChecks: string[] = [];

  let recommendation = "Historical Data Model";

  if (answers.reportingGoal === "CURRENT_STATE") {
    recommendation = "Current-State Reporting Model";
    architecture.push("Current-state curated table");
    operations.push("Select latest visible record per business key");
    patterns.push("State Modeling");
    validationChecklist.push("Check uniqueness of current record per entity");
  }

  if (answers.reportingGoal === "POINT_IN_TIME") {
    recommendation = "Point-in-Time Historical Model";
    architecture.push("Point-in-time reproducible historical model");
    operations.push("Apply valid-time and visible-time filtering");
    patterns.push("Snapshot Reproducibility");
    validationChecklist.push("Validate as-of results for selected reporting dates");
  }

  if (answers.reportingGoal === "SNAPSHOT") {
    recommendation = "Snapshot Fact Architecture";
    architecture.push("Periodic snapshot fact table");
    operations.push("Generate reporting snapshots at defined cut-off dates");
    patterns.push("Snapshot Reproducibility");
    validationChecklist.push("Check one row per entity and snapshot date");
    notebookStructure.push("07_generate_month_end_snapshots");
    risks.push("Snapshot drift", "Missing snapshot coverage");
    validationChecks.push(
      "Snapshot reproducibility",
      "One row per entity per snapshot"
    );
  }

  if (answers.reportingGoal === "EVENT") {
    recommendation = "Event-Centric Fact Model";
    architecture.push("Event-centric historical fact model");
    operations.push("Normalize and prioritize business events");
    patterns.push("Event Modeling", "Event Prioritization");
    validationChecklist.push("Check event ordering and duplicate event handling");
    risks.push("Duplicate events", "Incorrect event ordering");
    validationChecks.push("Event sequencing", "Duplicate event detection");
  }

  if (answers.reportingGoal === "AUDIT") {
    recommendation = "Bitemporal Audit Architecture";
    architecture.push("Bitemporal audit model");
    operations.push("Preserve business validity and technical visibility");
    patterns.push("Historical Correction", "CDC History Modeling");
    validationChecklist.push("Check that corrected history remains reproducible");
    risks.push("Lost correction history", "Non-reproducible audit results");
    validationChecks.push(
      "Visible-time validation",
      "Historical correction validation"
    );
  }

  if (answers.sourceTypes.includes("State Records")) {
    operations.push("Model source records as historical state intervals");
    patterns.push("State Modeling");
    validationChecklist.push("Detect valid-time overlaps and gaps");
    risks.push("Historical overlaps", "Historical gaps");
    validationChecks.push("Overlap detection", "Gap detection");
  }

  if (answers.sourceTypes.includes("Events")) {
    operations.push(
      "Align business events to the relevant state at reporting time"
    );
    patterns.push("State ↔ Event Alignment");
    validationChecklist.push("Check that each event maps to the expected state");
    risks.push("Event-to-state mismatch");
    validationChecks.push("Event alignment validation");
  }

  if (answers.sourceTypes.includes("Change Log / CDC")) {
    operations.push("Reconstruct historical state from change log / CDC records");
    patterns.push("CDC History Modeling");
    validationChecklist.push("Validate ordering of changes per business key");
  }

  if (answers.sourceTypes.includes("Reference Data")) {
    operations.push("Attach stable lookup or classification attributes");
    patterns.push("Reference Data Conformance");
    validationChecklist.push("Check missing or invalid reference keys");
  }

  if (answers.sourceTypes.includes("Business Relationships")) {
    operations.push("Historize relationships between business entities");
    patterns.push("Temporal Relationship Modeling");
    validationChecklist.push("Check relationship validity over time");
  }

  if (answers.historyCorrected === "YES") {
    architecture.push("Bitemporal model with correction visibility");
    operations.push("Track when historical corrections became visible");
    patterns.push("Historical Correction");
    validationChecklist.push("Validate visible_from / visible_to intervals");
  }

  if (answers.multipleSystems === "YES") {
    operations.push("Conform identities and timelines across systems");
    patterns.push("Identity Resolution", "Temporal Conformance");
    validationChecklist.push("Check cross-system key stability");
    notebookStructure.push("03_identity_resolution");
    risks.push("Identity mismatch", "Cross-system timeline drift");
    validationChecks.push(
      "Identity resolution validation",
      "Cross-system conformance"
    );
  }

  if (answers.changingRelationships === "YES") {
    operations.push("Build historized relationship bridge");
    patterns.push("Temporal Relationship Modeling");
    validationChecklist.push("Check relationship changes against snapshot dates");
  }

  if (answers.historizedDimensions === "SCD1") {
    architecture.push("Fact table with current dimensions");
    operations.push("Attach latest dimension attributes");
    patterns.push("SCD1 Dimension Modeling");
  }

  if (answers.historizedDimensions === "SCD2") {
    architecture.push("Fact table with SCD2 dimensions");
    operations.push("Join facts to dimensions by business-valid time");
    patterns.push("Dimension Completion");
    validationChecklist.push("Check dimension coverage for every fact row");
    risks.push("Missing dimension coverage");
    validationChecks.push("Dimension coverage validation");
  }

  if (answers.historizedDimensions === "BITEMPORAL") {
    architecture.push("Fact table with bitemporal dimensions");
    operations.push("Join facts to dimensions by valid-time and visible-time");
    patterns.push("Dimension Completion", "Snapshot Reproducibility");
    validationChecklist.push(
      "Check reproducibility of dimension values per as-of date"
    );
    risks.push("Missing dimension coverage");
    validationChecks.push(
      "Dimension coverage validation",
      "Bitemporal dimension reproducibility"
    );
  }

  return {
    recommendation,
    architecture: unique(architecture),
    operations: unique(operations),
    patterns: unique(patterns),
    validationChecklist: unique(validationChecklist),
    notebookStructure: unique(notebookStructure),
    risks: unique(risks),
    validationChecks: unique(validationChecks),
  };
}

export function generateAdvisorMarkdown(
  answers: AdvisorAnswers,
  blueprint: AdvisorBlueprint
) {
  return `# Historical Modeling Blueprint

## Purpose

This blueprint summarizes the recommended historical modeling approach based on the provided requirements.

Use it to:

- design the target model
- review historical modeling decisions
- plan implementation work
- communicate the architecture to other engineers
- define validation requirements

## Modeling Objective

${generateModelingObjective(answers, blueprint)}

## Recommended Architecture

${blueprint.recommendation}

## Why this recommendation

This recommendation was generated from the following modeling inputs:

- Reporting goal: ${formatReportingGoal(answers.reportingGoal)}
- Source types: ${answers.sourceTypes.join(", ")}
- History can change later: ${formatYesNoUnknown(answers.historyCorrected)}
- Multiple systems involved: ${formatYesNo(answers.multipleSystems)}
- Time-dependent relationships: ${formatYesNo(answers.changingRelationships)}
- Dimension behavior: ${formatDimensionNeed(answers.historizedDimensions)}

## Architecture Components

${toMarkdownList(blueprint.architecture)}

## Required Modeling Operations

${generateGroupedOperationsMarkdown(blueprint.operations)}

## Required Patterns

${toMarkdownList(blueprint.patterns)}

## Key Modeling Risks

${generateRiskMarkdown(blueprint.risks)}

## Validation Strategy

${toMarkdownList(blueprint.validationChecks)}

## Recommended Implementation Plan

${generateImplementationStructureMarkdown(answers)}
`;
}

function toMarkdownList(items: string[]) {
  if (items.length === 0) return "- None";

  return items.map((item) => `- ${item}`).join("\n");
}

function generateModelingObjective(
  answers: AdvisorAnswers,
  blueprint: AdvisorBlueprint
) {
  const goals: string[] = [];

  if (answers.reportingGoal === "SNAPSHOT") {
    goals.push(
      "produce reproducible reporting snapshots",
      "keep one consistent reporting view per snapshot date"
    );
  }

  if (answers.reportingGoal === "POINT_IN_TIME") {
    goals.push(
      "support point-in-time reporting",
      "return the correct historical state for a selected reporting date"
    );
  }

  if (answers.reportingGoal === "EVENT") {
    goals.push(
      "produce an event-oriented reporting product",
      "preserve and interpret business events"
    );
  }

  if (answers.reportingGoal === "AUDIT") {
    goals.push(
      "preserve historical corrections",
      "support auditability and reproducibility"
    );
  }

  if (answers.historyCorrected === "YES") {
    goals.push("handle late-arriving or corrected history");
  }

  if (answers.multipleSystems === "YES") {
    goals.push("align histories across multiple source systems");
  }

  if (answers.changingRelationships === "YES") {
    goals.push("track time-dependent relationships between business entities");
  }

  if (answers.historizedDimensions === "SCD2") {
    goals.push("attach attributes as they were valid at the reporting date");
  }

  if (answers.historizedDimensions === "BITEMPORAL") {
    goals.push("attach attributes as they were known at the reporting snapshot");
  }

  if (goals.length === 0) {
    return `Build a ${blueprint.recommendation} based on the selected reporting requirements.`;
  }

  return `Build a ${blueprint.recommendation} that can:

${goals.map((goal) => `- ${goal}`).join("\n")}`;
}

function generateGroupedOperationsMarkdown(operations: string[]) {
  const sourcePreparation = operations.filter((operation) =>
    includesAnyText(operation, [
      "Model source",
      "Reconstruct historical state",
      "Attach stable lookup",
    ])
  );

  const historicalAlignment = operations.filter((operation) =>
    includesAnyText(operation, [
      "Align business events",
      "Historize relationships",
      "Conform identities",
      "Build historized relationship",
      "Track when historical corrections",
    ])
  );

  const productBuild = operations.filter((operation) =>
    includesAnyText(operation, [
      "Generate reporting snapshots",
      "Join facts to dimensions",
      "Select latest visible record",
      "Normalize and prioritize",
      "Apply valid-time",
      "Preserve business validity",
    ])
  );

  const used = new Set([
    ...sourcePreparation,
    ...historicalAlignment,
    ...productBuild,
  ]);

  const other = operations.filter((operation) => !used.has(operation));

  const sections: string[] = [];

  if (sourcePreparation.length > 0) {
    sections.push(`### Source Preparation

${toMarkdownList(sourcePreparation)}`);
  }

  if (historicalAlignment.length > 0) {
    sections.push(`### Historical Alignment

${toMarkdownList(historicalAlignment)}`);
  }

  if (productBuild.length > 0) {
    sections.push(`### Data Product Build

${toMarkdownList(productBuild)}`);
  }

  if (other.length > 0) {
    sections.push(`### Other Operations

${toMarkdownList(other)}`);
  }

  return sections.length > 0 ? sections.join("\n\n") : "- None";
}

function generateRiskMarkdown(risks: string[]) {
  if (risks.length === 0) return "- None";

  return risks
    .map((risk) => {
      const explanation = getRiskExplanation(risk);

      return `### ${risk}

${explanation}`;
    })
    .join("\n\n");
}

function getRiskExplanation(risk: string) {
  if (risk === "Snapshot drift") {
    return "Historical reports may change when the same reporting period is rebuilt later.";
  }

  if (risk === "Missing snapshot coverage") {
    return "Entities or relationships may disappear from required reporting periods.";
  }

  if (risk === "Historical overlaps") {
    return "Multiple records may be valid for the same business key and time period.";
  }

  if (risk === "Historical gaps") {
    return "Required historical periods may have no valid record.";
  }

  if (risk === "Event-to-state mismatch") {
    return "Events may be attached to the wrong historical state or dimension version.";
  }

  if (risk === "Identity mismatch") {
    return "The same business entity may not be matched consistently across systems.";
  }

  if (risk === "Cross-system timeline drift") {
    return "Different systems may represent changes at different points in time.";
  }

  if (risk === "Missing dimension coverage") {
    return "Fact rows may not find a valid dimension row for the required reporting date.";
  }

  if (risk === "Duplicate events") {
    return "The same business event may be counted more than once.";
  }

  if (risk === "Incorrect event ordering") {
    return "Events may be interpreted in the wrong sequence.";
  }

  if (risk === "Lost correction history") {
    return "Historical corrections may overwrite previous states instead of preserving what was known at the time.";
  }

  if (risk === "Non-reproducible audit results") {
    return "Audit results may change when history is corrected or reloaded.";
  }

  return "Review this risk during implementation and validation.";
}

function generateImplementationStructureMarkdown(answers: AdvisorAnswers) {
  const sections = [
    `### 1. Define reporting grain and business goal

Describe what one output row represents.

Examples:
- one contract per month-end snapshot
- one event per business transaction
- one entity state per valid-time interval

Document:
- target table name
- business key
- reporting date logic
- expected consumers`,

    `### 2. Load and preserve source data

Load the required source tables without changing historical semantics.

Document:
- source table names
- business keys
- valid-time columns
- technical load or visibility timestamps
- known source limitations`,

    `### 3. Classify source behavior

Classify each source before modeling it.

Use categories such as:
- State Records: records valid for a time interval
- Events: point-in-time business events
- Change Log / CDC: technical change history
- Reference Data: lookup or classification data
- Business Relationships: links between entities that may change over time`,

    `### 4. Standardize historical columns

Normalize sources into a shared historical structure.

Recommended columns:
- business_key
- valid_from
- valid_to
- visible_from
- visible_to
- source_system
- record_hash
- is_current`,

    `### 5. Apply required modeling operations

Apply the operations selected by the Advisor.

Examples:
- reconstruct state from CDC
- align events to state intervals
- complete dimensions for all fact rows
- resolve identities across systems
- generate snapshot rows`,

    `### 6. Build the historical data product

Create the target historical model.

Depending on the recommendation, this may be:
- snapshot fact table
- event fact table
- SCD2 dimension
- bitemporal dimension
- current-state reporting table`,

    `### 7. Validate the output

Validate the model before publishing it.

Recommended checks:
- uniqueness at target grain
- valid-time overlaps
- valid-time gaps
- event-to-state alignment
- dimension coverage
- snapshot reproducibility`,
  ];

  if (answers.reportingGoal === "SNAPSHOT") {
    sections.push(
      `### 8. Generate reporting snapshots

Create reproducible snapshots for the required reporting dates.

Document:
- snapshot date calendar
- month-end or business cut-off logic
- late-arriving data handling
- rerun behavior
- expected row count per snapshot`
    );
  }

  if (
    answers.historizedDimensions === "SCD2" ||
    answers.historizedDimensions === "BITEMPORAL"
  ) {
    sections.push(
      `### 9. Validate historized dimension coverage

Ensure every fact row can find the correct dimension row.

Check:
- missing dimension matches
- ambiguous dimension matches
- valid-time alignment
- visible-time alignment if bitemporal`
    );
  }

  return sections.join("\n\n");
}

function includesAnyText(value: string, needles: string[]) {
  const lower = value.toLowerCase();
  return needles.some((needle) => lower.includes(needle.toLowerCase()));
}

function formatReportingGoal(goal: ReportingGoal) {
  if (goal === "CURRENT_STATE") return "Current-state reporting";
  if (goal === "POINT_IN_TIME") return "Point-in-time reporting";
  if (goal === "SNAPSHOT") return "Snapshot reporting";
  if (goal === "EVENT") return "Event reporting";
  if (goal === "AUDIT") return "Audit reporting";

  return goal;
}

function formatYesNo(value: "YES" | "NO") {
  return value === "YES" ? "Yes" : "No";
}

function formatYesNoUnknown(value: YesNoUnknown) {
  if (value === "YES") return "Yes";
  if (value === "NO") return "No";
  return "Unknown";
}

function formatDimensionNeed(value: DimensionNeed) {
  if (value === "NO") return "No historized dimensions";
  if (value === "SCD1") return "Current attributes / SCD1";
  if (value === "SCD2") return "Historized attributes / SCD2";
  if (value === "BITEMPORAL") return "Bitemporal dimensions";

  return value;
}