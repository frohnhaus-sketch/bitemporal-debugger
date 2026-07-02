import type { TargetFinding } from "@/lib/types";

export type RuleFacts = Partial<{
  validTimeOverlapCount: number;
  validTimeGapCount: number;
  duplicateSnapshotGrainCount: number;
  bitemporalConflictCount: number;

  hasCriticalReproducibilityRisk: boolean;
  hasTemporalAmbiguity: boolean;
  hasCoverageProblem: boolean;
  duplicateIntervalCount?: number;
  hasDuplicateIntervals?: boolean;
  snapshotCoverageGapCount?: number;
  hasSnapshotCoverageGap?: boolean;
  hasDuplicateSnapshotGrain?: boolean;
  coverageGapRiskCount?: number;

  stateReductionRiskCount?: number;
  hasStateReductionRisk?: boolean;

  eventPrioritizationRiskCount?: number;
  hasEventPrioritizationRisk?: boolean;
}>;

export type RuleResult = {
  findings: TargetFinding[];
  facts: RuleFacts;
};
