export type ParseOptions = {
  maxColumns?: number | "all";
};

export type ParseResult = {
  rows: any[];
  headerMappings: HeaderMapping[];
};

export type TemporalIssue = {
  id: string;
  type: TemporalIssueType;
  entity_id: string | number;
  source?: string;
  targetSource?: string;
  from?: string;
  to?: string;
  severity: TemporalIssueSeverity;
  affectedRows?: number[];
  title: string;
  explanation: string;
  originalIssue?: SelectedDebugIssue;
};

export type SnapshotMeaning =
  | "period_end"
  | "period_start"
  | "reporting_timestamp"
  | "none";

export type IntervalEndSemantics = "exclusive" | "inclusive";

export type OpenEndedValue = "9999-12-31" | "null" | "custom" | "none";

export type CorrectionMode =
  | "valid_time"
  | "bitemporal"
  | "published_snapshot";

export type SemanticsConfidence = {
  validIntervalEnd: number;
  visibleIntervalEnd: number;
  snapshotMeaning: number;
  openEndedValue: number;
  correctionMode: number;
};

export type HeaderMapping = {
  original: string;
  normalized: string;
};

export type BitemporalRow = {
  source: string;
  entity_id: string;
  value: string;
  valid_from: string;
  valid_to: string;
  visible_from: string;
  visible_to: string | null;
};

export type DriftSummary = {
  sourceA: string;
  sourceB: string;
  lagMs: number;
  entityCount: number;
  entityIds: string[];
  severity: "info" | "warning";
};

export type AggregatedJoinabilityIssue = JoinabilityIssue & {
  isAggregated?: boolean;
  count?: number;
  entityIds?: Array<string | number>;
};

export type JoinabilityIssueReason =
  | "NO_VALID_MATCH"
  | "NO_VISIBLE_OVERLAP"
  | "MULTIPLE_MATCHES";

export type JoinabilityIssueType = "JOIN_GAP" | "JOIN_AMBIGUITY";

export type JoinabilityIssue = {
  entity_id: string;
  source: string;
  targetSource: string;
  valid_from: string;
  valid_to: string;
  visible_from: string;
  visible_to: string | null;
  type: JoinabilityIssueType;
  matchingRows: number;
  message: string;
  reason: JoinabilityIssueReason;
};

export type OverlapIssue = {
  source: string;
  entity_id: string;
  from: string;
  to: string;
  message: string;
};

export type ValidationMode = "monotemporal" | "bitemporal";

export type HighlightTarget = {
  entity_id: string;
  source?: string;
  valid_from?: string;
  valid_to?: string;
};

export type GapIssue = {
  entity_id: string | number;
  source?: string;
  from?: string;
  to?: string;
  valid_from?: string;
  valid_to?: string;
};

export type DimensionCompletionIssue = {
  sourceRow: BitemporalRow;
  targetRows: BitemporalRow[];
};

export type SelectedDebugIssue =
  | { kind: "join"; issue: AggregatedJoinabilityIssue }
  | { kind: "gap"; issue: GapIssue }
  | { kind: "overlap"; issue: OverlapIssue }
  | { kind: "drift"; issue: DriftSummary }
  | { kind: "dimension-completion"; issue: DimensionCompletionIssue };

export type TemporalIssueType =
  | "OVERLAP"
  | "VALID_GAP"
  | "JOIN_GAP"
  | "JOIN_AMBIGUITY"
  | "VISIBILITY_LAG"
  | "SNAPSHOT_DRIFT"
  | "DIMENSION_COMPLETION_RISK";

export type TemporalIssueSeverity = "low" | "medium" | "high";

export type TargetFinding = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  evidence: string[];
  recommendation: string;
  assumptions?: string[];
};

export type DetectedColumns = {
  businessKey: string | null;
  validFrom: string | null;
  validTo: string | null;
  visibleFrom: string | null;
  visibleTo: string | null;
  snapshotDate: string | null;
  dimensionColumns: string[];
};

export type HistoricalSemantics = {
  validIntervalEnd: IntervalEndSemantics;
  visibleIntervalEnd: IntervalEndSemantics;
  snapshotMeaning: SnapshotMeaning;
  openEndedValue: OpenEndedValue;
  correctionMode: CorrectionMode;

  confidence: {
    validIntervalEnd: number;
    visibleIntervalEnd: number;
    snapshotMeaning: number;
    openEndedValue: number;
    correctionMode: number;
  };

  detectedSignals: string[];
  explanations: string[];
};


export type TargetValidationResult = {
  rowCount: number;
  rows: any[];
  columns: string[];
  headerMappings: HeaderMapping[];
  detectedColumns: DetectedColumns;
  semantics: HistoricalSemantics;
  findings: TargetFinding[];
  qualitySummary: {
    counts: {
      high: number;
      medium: number;
      low: number;
    };
    label: string;
    description: string;
    severity: "danger" | "warning" | "success";
  };
};