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
    risks.push(
      "Snapshot drift",
      "Missing snapshot coverage"
    );

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
    risks.push(
      "Duplicate events",
      "Incorrect event ordering"
    );

    validationChecks.push(
      "Event sequencing",
      "Duplicate event detection"
    );
  }
  if (answers.reportingGoal === "AUDIT") {
    recommendation = "Bitemporal Audit Architecture";
    architecture.push("Bitemporal audit model");
    operations.push("Preserve business validity and technical visibility");
    patterns.push("Historical Correction", "CDC History Modeling");
    validationChecklist.push("Check that corrected history remains reproducible");
    risks.push(
      "Lost correction history",
      "Non-reproducible audit results"
    );

    validationChecks.push(
      "Visible-time validation",
      "Historical correction validation"
    );
  }
  if (answers.sourceTypes.includes("State Records")) {
     operations.push("Model source records as historical state intervals");
     patterns.push("State Modeling");
     validationChecklist.push("Detect valid-time overlaps and gaps");
     risks.push(
       "Historical overlaps",
       "Historical gaps"
     );
     
     validationChecks.push(
       "Overlap detection",
       "Gap detection"
     );
  }
  if (answers.sourceTypes.includes("Events")) {
     operations.push("Align business events to the relevant state at reporting time");
     patterns.push("State ↔ Event Alignment");
     validationChecklist.push("Check that each event maps to the expected state");
     risks.push(
       "Event-to-state mismatch"
     );
     
     validationChecks.push(
       "Event alignment validation"
     );
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
    risks.push(
      "Identity mismatch",
      "Cross-system timeline drift"
    );

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
    risks.push(
      "Missing dimension coverage"
    );

    validationChecks.push(
      "Dimension coverage validation"
    );
  }
  if (answers.historizedDimensions === "BITEMPORAL") {
    architecture.push("Fact table with bitemporal dimensions");
    operations.push("Join facts to dimensions by valid-time and visible-time");
    patterns.push("Dimension Completion", "Snapshot Reproducibility");
    validationChecklist.push("Check reproducibility of dimension values per as-of date");
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

## Recommended Architecture

${blueprint.recommendation}

## Why this recommendation

This recommendation was generated from the following modeling inputs:

- Reporting goal: ${answers.reportingGoal}
- Source types: ${answers.sourceTypes.join(", ")}
- History can change later: ${answers.historyCorrected}
- Multiple systems involved: ${answers.multipleSystems}
- Time-dependent relationships: ${answers.changingRelationships}
- Dimension behavior: ${answers.historizedDimensions}

## Architecture

${toMarkdownList(blueprint.architecture)}

## Required Modeling Operations

${toMarkdownList(blueprint.operations)}

## Required Patterns

${toMarkdownList(blueprint.patterns)}

## Key Modeling Risks

${toMarkdownList(blueprint.risks)}

## Validation Checks

${toMarkdownList(blueprint.validationChecks)}

## Suggested Implementation Structure

${generateImplementationStructureMarkdown(answers)}

## Purpose

This blueprint summarizes the recommended historical modeling approach based on the provided requirements.

Use it to:

- design the target model
- review historical modeling decisions
- plan implementation work
- communicate the architecture to other engineers
- define validation requirements

## Recommended Workflow

1. Define the reporting grain and business goal.
2. Load and preserve source data.
3. Classify source behavior.
4. Standardize historical columns.
5. Apply the required modeling operations.
6. Build the historical data product.
7. Validate the output against the listed risks and validation checks.
`;
}

function toMarkdownList(items: string[]) {
  if (items.length === 0) return "- None";

  return items.map((item) => `- ${item}`).join("\n");
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

  if (answers.historizedDimensions === "SCD2" || answers.historizedDimensions === "BITEMPORAL") {
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