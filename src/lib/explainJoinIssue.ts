import type { AggregatedJoinabilityIssue } from "@/lib/types";

export type JoinExplanation = {
  headline: string;
  title: string;
  summary: string;
  cause: string;
  interpretation: string;
  severity: "warning" | "error";
  hints: string[];
  fixes: string[];
  sqlSuggestion?: string;
};

function formatEntityScope(issue: AggregatedJoinabilityIssue) {
  if (issue.isAggregated) {
    return `${issue.count} entities are affected by this pattern`;
  }

  return `Entity ${issue.entity_id} is affected`;
}

function formatSourceDirection(issue: AggregatedJoinabilityIssue) {
  return `${issue.source} → ${issue.targetSource}`;
}

export function explainJoinIssue(
  issue: AggregatedJoinabilityIssue
): JoinExplanation {
  const scope = formatEntityScope(issue);
  const direction = formatSourceDirection(issue);

  if (issue.type === "JOIN_AMBIGUITY" || issue.reason === "MULTIPLE_MATCHES") {
    return {
      headline: `${
        issue.entity_id ? `Entity ${issue.entity_id}` : "This pattern"
      } creates duplicate JOIN results.`,
      title: "Ambiguous join",
      summary: `${scope}. The join from ${direction} finds multiple possible matches.`,
      cause:
        "The target source contains more than one historical candidate for the same business-effective period.",
      interpretation: issue.isAggregated
        ? "Because this happens across multiple entities, it likely points to a systematic overlap or duplication pattern in the target source."
        : "This usually means the target source has overlapping valid-time ranges, duplicate records, or the join needs an additional tie-breaker.",
      severity: "error",
      hints: [
        `Check overlapping historical intervals in ${issue.targetSource}.`,
        "Look for duplicate records for the same entity.",
        "Add another join condition if multiple matches are expected.",
      ],
      fixes: [
        "Remove overlapping valid-time records in the target source.",
        "Deduplicate rows for the same entity and valid-time window.",
        "Add a deterministic tie-breaker, for example latest visible_from.",
      ],
      sqlSuggestion: `-- Keep one temporal match deterministically
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY entity_id, valid_from, valid_to
  ORDER BY visible_from DESC
) = 1`,
    };
  }

  if (issue.reason === "NO_VALID_MATCH") {
    return {
      headline: `${
        issue.entity_id ? `Entity ${issue.entity_id}` : "This pattern"
      } has no valid-time match.`,
      title: "No valid-time match",
      summary: `${scope}. No row in ${issue.targetSource} covers the same valid-time period.`,
      cause: `The valid-time range ${issue.valid_from} → ${issue.valid_to} in ${issue.source} does not overlap with a matching row in ${issue.targetSource}.`,
      interpretation: issue.isAggregated
        ? "Because this affects many entities with the same time window, this looks like a systematic valid-time mismatch rather than random bad rows."
        : "This usually indicates missing historical data, an incomplete timeline, or different business validity definitions between both sources.",
      severity: "warning",
      hints: [
        `Check whether ${issue.targetSource} has a gap around ${issue.valid_from} → ${issue.valid_to}.`,
        "Verify that both sources use the same valid-time semantics.",
        "Check whether the target source is missing historical records.",
        "Remember: valid-time is interpreted as inclusive [valid_from, valid_to].",
      ],
      fixes: [
        "Backfill the missing valid-time period in the target source.",
        "Check whether valid_from / valid_to are mapped correctly.",
        "Align the business validity rules between both sources.",
      ],
      sqlSuggestion: `-- Find source rows without a valid-time match
SELECT a.*
FROM source_a a
LEFT JOIN source_b b
  ON a.entity_id = b.entity_id
 AND a.valid_from <= b.valid_to
 AND a.valid_to >= b.valid_from
WHERE b.entity_id IS NULL;`,
    };
  }

  if (issue.reason === "NO_VISIBLE_OVERLAP") {
    return {
      headline: `${
        issue.entity_id ? `Entity ${issue.entity_id}` : "This pattern"
      } has no visible-time overlap.`,
      title: "No visible-time overlap",
      summary: `${scope}. A valid-time match exists, but both records were not visible at the same time.`,
      cause:
        "The business-effective period matches, but the transaction-time / visibility windows do not overlap.",
      interpretation: issue.isAggregated
        ? "Because this repeats across multiple entities, it likely indicates pipeline latency, delayed ingestion, or a systematic load-order problem."
        : "This often happens with delayed ingestion, late-arriving records, or corrections loaded at different times.",
      severity: "warning",
      hints: [
        `Compare visible_from and visible_to between ${issue.source} and ${issue.targetSource}.`,
        `Check whether ${issue.targetSource} was loaded later than ${issue.source}.`,
        "Look for backfills, late-arriving data, or correction batches.",
        "Remember: visible-time is interpreted as half-open [visible_from, visible_to).",
      ],
      fixes: [
        "Check whether the target source was loaded later than the source row.",
        "Align ingestion / visible-time timestamps across both pipelines.",
        "If this is expected, define a visible-time snapshot rule, for example latest visible record as of the reporting timestamp.",
      ],
      sqlSuggestion: `-- Require visible-time overlap
AND a.visible_from < b.visible_to
AND b.visible_from < a.visible_to`,
    };
  }

  return {
    headline: "Join issue",
    title: "Join issue",
    summary: `${scope}. The join from ${direction} could not be resolved cleanly.`,
    cause: "The debugger found a temporal mismatch.",
    interpretation:
      "Inspect valid-time and visible-time ranges to understand why the join failed.",
    severity: "warning",
    hints: [
      "Compare both timelines.",
      "Check valid-time overlap.",
      "Check visible-time overlap.",
    ],
    fixes: [
      "Inspect the affected rows in both sources.",
      "Compare valid-time and visible-time windows.",
      "Check whether the join condition needs an additional key or tie-breaker.",
    ],
  };
}