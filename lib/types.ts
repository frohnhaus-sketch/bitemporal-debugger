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

export type SelectedDebugIssue =
  | { kind: "join"; issue: AggregatedJoinabilityIssue }
  | { kind: "gap"; issue: GapIssue }
  | { kind: "overlap"; issue: OverlapIssue }
  | { kind: "drift"; issue: DriftSummary };

export type TemporalIssueType =
  | "OVERLAP"
  | "VALID_GAP"
  | "JOIN_GAP"
  | "JOIN_AMBIGUITY"
  | "VISIBILITY_LAG";

export type TemporalIssueSeverity = "low" | "medium" | "high";