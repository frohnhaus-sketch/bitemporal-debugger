import type {
  AggregatedJoinabilityIssue,
  GapIssue,
  OverlapIssue,
  SelectedDebugIssue,
  TemporalIssue,
} from "./types";

export function buildTemporalIssues(params: {
  joinIssues: AggregatedJoinabilityIssue[];
  gaps: GapIssue[];
  overlapMarkers: OverlapIssue[];
}): TemporalIssue[] {
  const { joinIssues, gaps, overlapMarkers } = params;

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
        "Multiple rows overlap in valid-time. Historical joins may become nondeterministic.",

      originalIssue: {
        kind: "overlap",
        issue: overlap,
      } satisfies SelectedDebugIssue,
    })
  );

  return [
    ...normalizedJoinIssues,
    ...normalizedGaps,
    ...normalizedOverlaps,
  ];
}