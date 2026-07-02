import type { TargetValidationResult } from "@/lib/types";
import type { AnalyzerFacts, ModelFacts } from "./types";
import type { RuleFacts } from "@/lib/analyzer/rules/types";
import { mergeRuleFacts } from "@/lib/analyzer/context/mergeRuleFacts";

export function deriveModelFacts(result: TargetValidationResult): ModelFacts {
  return {
    hasBusinessKey: Boolean(result.detectedColumns.businessKey),
    hasValidTime: Boolean(
      result.detectedColumns.validFrom && result.detectedColumns.validTo,
    ),
    hasVisibleTime: Boolean(
      result.detectedColumns.visibleFrom && result.detectedColumns.visibleTo,
    ),
    hasSnapshot: Boolean(result.detectedColumns.snapshotDate),
  };
}

export function deriveFacts(
  result: TargetValidationResult,
  ruleFacts?: RuleFacts,
): AnalyzerFacts {
  const modelFacts = deriveModelFacts(result);

  const highFindingCount = result.findings.filter(
    (finding) => finding.severity === "high",
  ).length;

  const mediumFindingCount = result.findings.filter(
    (finding) => finding.severity === "medium",
  ).length;

  const lowFindingCount = result.findings.filter(
    (finding) => finding.severity === "low",
  ).length;

  const derivedFacts: AnalyzerFacts = {
    ...modelFacts,

    highFindingCount,
    mediumFindingCount,
    lowFindingCount,

    validTimeOverlapCount: 0,
    bitemporalConflictCount: 0,
    validTimeGapCount: 0,
    snapshotCoverageGapCount: 0,
    duplicateSnapshotGrainCount: 0,

    hasCriticalReproducibilityRisk: highFindingCount > 0,
    hasTemporalAmbiguity: false,
    hasCoverageProblem: false,
  };

  return mergeRuleFacts(derivedFacts, ruleFacts);
}