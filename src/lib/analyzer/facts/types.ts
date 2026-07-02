export type ModelFacts = {
  hasBusinessKey: boolean;
  hasValidTime: boolean;
  hasVisibleTime: boolean;
  hasSnapshot: boolean;
};

export type AnalyzerFacts = ModelFacts & {
  highFindingCount: number;
  mediumFindingCount: number;
  lowFindingCount: number;

  validTimeOverlapCount: number;
  bitemporalConflictCount: number;
  validTimeGapCount: number;
  snapshotCoverageGapCount: number;
  duplicateSnapshotGrainCount: number;

  hasCriticalReproducibilityRisk: boolean;
  hasTemporalAmbiguity: boolean;
  hasCoverageProblem: boolean;
};