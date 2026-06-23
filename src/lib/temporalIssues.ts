import type {
  AggregatedJoinabilityIssue,
  BitemporalRow,
  DriftSummary,
  GapIssue,
  OverlapIssue,
  SelectedDebugIssue,
  TemporalIssue,
  ValidationMode,
} from "./types";

function toDate(value: unknown): Date | null {
  if (!value) return null;

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
) {
  return aStart < bEnd && bStart < aEnd;
}

function fullyCovers(
  sourceStart: Date,
  sourceEnd: Date,
  targetStart: Date,
  targetEnd: Date
) {
  return targetStart <= sourceStart && targetEnd >= sourceEnd;
}

function detectDimensionCompletionRisks(
  rows: BitemporalRow[],
  sourceNameA: string,
  sourceNameB: string
): TemporalIssue[] {
  const issues: TemporalIssue[] = [];

  const sourceARows = rows.filter((row) => row.source === sourceNameA);
  const sourceBRows = rows.filter((row) => row.source === sourceNameB);

  for (const sourceRow of sourceARows) {
    const sourceStart = toDate(sourceRow.valid_from);
    const sourceEnd = toDate(sourceRow.valid_to);

    if (!sourceStart || !sourceEnd) continue;

    const targetRows = sourceBRows.filter(
      (targetRow) => String(targetRow.entity_id) === String(sourceRow.entity_id)
    );

    if (targetRows.length === 0) continue;

    const overlappingRows = targetRows.filter((targetRow) => {
      const targetStart = toDate(targetRow.valid_from);
      const targetEnd = toDate(targetRow.valid_to);

      if (!targetStart || !targetEnd) return false;

      return intervalsOverlap(sourceStart, sourceEnd, targetStart, targetEnd);
    });

    if (overlappingRows.length === 0) continue;

    const hasFullCover = overlappingRows.some((targetRow) => {
      const targetStart = toDate(targetRow.valid_from);
      const targetEnd = toDate(targetRow.valid_to);

      if (!targetStart || !targetEnd) return false;

      return fullyCovers(sourceStart, sourceEnd, targetStart, targetEnd);
    });

    if (hasFullCover) continue;

    issues.push({
      id: `dimension-completion-${issues.length}`,

      type: "DIMENSION_COMPLETION_RISK",

      entity_id: sourceRow.entity_id,

      source: sourceRow.source,
      targetSource: sourceNameB,

      from: sourceRow.valid_from,
      to: sourceRow.valid_to,

      severity: "high",

      title: "Dimension completion risk",

      explanation:
        "The target source covers only part of the required historical interval. Downstream snapshots may produce incomplete dimension attributes.",

      originalIssue: {
        kind: "dimension-completion",
        issue: {
          sourceRow,
          targetRows: overlappingRows,
        },
      } satisfies SelectedDebugIssue,
    });
  }

  return issues;
}

export function buildTemporalIssues(params: {
  rows?: BitemporalRow[];
  sourceAName?: string;
  sourceBName?: string;
  joinIssues: AggregatedJoinabilityIssue[];
  gaps: GapIssue[];
  overlapMarkers: OverlapIssue[];
  drifts?: DriftSummary[];
  validationMode?: ValidationMode;
}): TemporalIssue[] {
  const {
    rows = [],
    sourceAName = "source_a",
    sourceBName = "source_b",
    joinIssues,
    gaps,
    overlapMarkers,
    drifts = [],
    validationMode = "monotemporal",
  } = params;

  const normalizedJoinIssues: TemporalIssue[] = joinIssues.map(
    (issue, index) => ({
      id: `join-${index}`,

      type: issue.type,

      entity_id: issue.entity_id,

      source: issue.source,
      targetSource: issue.targetSource,

      from: issue.valid_from,
      to: issue.valid_to,

      severity: issue.type === "JOIN_AMBIGUITY" ? "high" : "medium",

      title:
        issue.type === "JOIN_AMBIGUITY"
          ? "Ambiguous temporal JOIN"
          : "Missing temporal JOIN match",

      explanation:
        issue.type === "JOIN_AMBIGUITY"
          ? "Multiple historical rows match the same interval. Your JOIN may create duplicated or inflated results."
          : "No matching historical row exists during this interval. Your JOIN may silently drop rows.",

      originalIssue: {
        kind: "join",
        issue,
      } satisfies SelectedDebugIssue,
    })
  );

  const normalizedGaps: TemporalIssue[] = gaps.map((gap, index) => ({
    id: `gap-${index}`,

    type: "VALID_GAP",

    entity_id: gap.entity_id,

    source: gap.source,

    from: gap.from ?? gap.valid_from,
    to: gap.to ?? gap.valid_to,

    severity: "medium",

    title: "Valid-time gap",

    explanation:
      "This entity contains missing valid-time coverage. Historical queries may return incomplete results.",

    originalIssue: {
      kind: "gap",
      issue: gap,
    } satisfies SelectedDebugIssue,
  }));

  const normalizedOverlaps: TemporalIssue[] = overlapMarkers.map(
    (overlap, index) => ({
      id: `overlap-${index}`,

      type: "OVERLAP",

      entity_id: overlap.entity_id,

      source: overlap.source,

      from: overlap.from,
      to: overlap.to,

      severity: "high",

      title: "Overlapping historization",

      explanation:
        validationMode === "bitemporal"
          ? "Multiple rows overlap in both valid-time and visible-time. Historical joins may become nondeterministic."
          : "Multiple rows overlap in valid-time. Historical joins may become nondeterministic.",

      originalIssue: {
        kind: "overlap",
        issue: overlap,
      } satisfies SelectedDebugIssue,
    })
  );

  const normalizedVisibilityLagIssues: TemporalIssue[] = drifts.map(
    (drift, index) => {
      const laggingSource = drift.lagMs > 0 ? drift.sourceB : drift.sourceA;
      const leadingSource = drift.lagMs > 0 ? drift.sourceA : drift.sourceB;

      const minutes = Math.round(Math.abs(drift.lagMs) / 60000);

      return {
        id: `visibility-lag-${index}`,

        type: "VISIBILITY_LAG",

        entity_id: drift.entityIds[0] ?? "multiple",

        source: laggingSource,
        targetSource: leadingSource,

        severity: drift.severity === "warning" ? "medium" : "low",

        title: "Visibility lag",

        explanation: `${laggingSource} appears ${minutes} min after ${leadingSource} across ${drift.entityCount} entities. This may indicate source latency rather than incorrect historization.`,

        originalIssue: {
          kind: "drift",
          issue: drift,
        } satisfies SelectedDebugIssue,
      };
    }
  );

  const dimensionCompletionRisks = detectDimensionCompletionRisks(
    rows,
    sourceAName,
    sourceBName
  );
  return [
    ...normalizedJoinIssues,
    ...dimensionCompletionRisks,
    ...normalizedGaps,
    ...normalizedOverlaps,
    ...normalizedVisibilityLagIssues,
  ];
}