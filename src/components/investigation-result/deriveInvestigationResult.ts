import type { TargetValidationResult } from "@/lib/types";

export type InvestigationVerdict =
  | "not_reproducible"
  | "unstable_rebuild"
  | "needs_review"
  | "clean";

export type ReasoningSignal = {
  label: string;
  detected: boolean;
};

export type InvestigationResultViewModel = {
  verdict: InvestigationVerdict;
  title: string;
  summary: string;
  rootCauseTitle: string;
  rootCause: string;
  businessImpactTitle: string;
  businessImpact: string;
  recommendationTitle: string;
  recommendation: string;
  reasoning: ReasoningSignal[];
};

function includesAny(value: string, terms: string[]) {
  const normalized = value.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function findingText(finding: unknown): string {
  if (!finding || typeof finding !== "object") return "";

  const record = finding as Record<string, unknown>;

  return [
    record.type,
    record.code,
    record.title,
    record.message,
    record.description,
    record.severity,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function deriveInvestigationResult(
  result: TargetValidationResult
): InvestigationResultViewModel {
  const findingsText = result.findings.map(findingText).join(" ");

  const hasBusinessKey = Boolean(result.detectedColumns.businessKey);
  const hasValidTime = Boolean(
    result.detectedColumns.validFrom || result.detectedColumns.validTo
  );
  const hasVisibleTime = Boolean(
    result.detectedColumns.visibleFrom || result.detectedColumns.visibleTo
  );
  const hasSnapshot = Boolean(result.detectedColumns.snapshotDate);

  const hasOverlap = includesAny(findingsText, [
    "overlap",
    "duplicate interval",
    "duplicate intervals",
  ]);

  const hasCoverageGap = includesAny(findingsText, [
    "coverage gap",
    "missing coverage",
    "missing monthly coverage",
    "missing period",
    "gap",
  ]);

  const hasDuplicateSnapshotGrain = includesAny(findingsText, [
    "duplicate snapshot",
    "duplicate snapshot grain",
    "snapshot grain",
  ]);

  const hasReproducibilityRisk = includesAny(findingsText, [
    "reproducibility",
    "cannot be reproduced",
    "not reproducible",
    "published snapshot",
  ]);

  const reasoning: ReasoningSignal[] = [
    { label: "Business Key detected", detected: hasBusinessKey },
    { label: "Valid Time detected", detected: hasValidTime },
    { label: "Visible Time detected", detected: hasVisibleTime },
    { label: "Snapshot grain detected", detected: hasSnapshot },
    { label: "Duplicate intervals detected", detected: hasOverlap },
    { label: "Missing coverage detected", detected: hasCoverageGap },
    {
      label: "Duplicate snapshot grain detected",
      detected: hasDuplicateSnapshotGrain,
    },
  ];

  if (hasCoverageGap || hasDuplicateSnapshotGrain || hasReproducibilityRisk) {
    return {
      verdict: "not_reproducible",
      title: "Historical reports cannot be reproduced.",
      summary:
        "The analyzer found structural risks that can make regenerated historical reports differ from already published numbers.",
      rootCauseTitle: "Root Cause",
      rootCause: hasCoverageGap
        ? "Some expected historical periods are missing for the same business entity."
        : "The same reporting grain appears more than once, which makes the historical result ambiguous.",
      businessImpactTitle: "Business Impact",
      businessImpact:
        "Published finance, revenue or operational reports may change after a rebuild. Teams may see different numbers for the same historical period.",
      recommendationTitle: "Recommendation",
      recommendation: hasCoverageGap
        ? "Generate complete period coverage before publishing snapshots. Add explicit rows for missing months or model gaps intentionally."
        : "Ensure one deterministic row per business key and snapshot period. Add a winner selection rule before publishing.",
      reasoning,
    };
  }

  if (hasOverlap) {
    return {
      verdict: "unstable_rebuild",
      title: "Reports may change after historical rebuilds.",
      summary:
        "The analyzer found overlapping validity periods. This can produce ambiguous joins, duplicated facts or unstable results.",
      rootCauseTitle: "Root Cause",
      rootCause:
        "Multiple rows are valid for the same business entity at the same point in time.",
      businessImpactTitle: "Business Impact",
      businessImpact:
        "Historical joins may duplicate facts or choose different dimension rows depending on query logic.",
      recommendationTitle: "Recommendation",
      recommendation:
        "Normalize interval boundaries and add deterministic winner selection before compaction or snapshot generation.",
      reasoning,
    };
  }

  if (!hasBusinessKey || !hasValidTime) {
    return {
      verdict: "needs_review",
      title: "Historical model needs review.",
      summary:
        "The analyzer could not confidently detect the minimum structure needed to validate historical correctness.",
      rootCauseTitle: "Root Cause",
      rootCause:
        "The table is missing a clearly detectable business key or valid-time structure.",
      businessImpactTitle: "Business Impact",
      businessImpact:
        "The analyzer cannot reliably determine whether historical rows represent clean state changes, snapshots or partial history.",
      recommendationTitle: "Recommendation",
      recommendation:
        "Confirm the business key and valid-time columns before relying on this table for historical reporting.",
      reasoning,
    };
  }

  return {
    verdict: "clean",
    title: "No critical historical risks detected.",
    summary:
      "The analyzer did not find critical reproducibility, coverage or interval risks in this table.",
    rootCauseTitle: "Root Cause",
    rootCause:
      "No critical root cause was detected based on the available structure and findings.",
    businessImpactTitle: "Business Impact",
    businessImpact:
      "Historical reports based on this table are less likely to change unexpectedly after regeneration.",
    recommendationTitle: "Recommendation",
    recommendation:
      "Keep validating this table when upstream logic, interval semantics or snapshot generation changes.",
    reasoning,
  };
}