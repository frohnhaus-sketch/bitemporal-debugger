import type { BitemporalRow, JoinabilityIssue } from "./types";
import {
  closedDateIntervalsOverlap,
  halfOpenTimestampIntervalsOverlap,
} from "./dates";

type AggregatedJoinabilityIssue = JoinabilityIssue & {
  isAggregated?: boolean;
  count?: number;
  entityIds?: Array<string | number>;
};

export function analyzeJoinability(
  rows: BitemporalRow[],
  leftSource: string,
  rightSource: string
): AggregatedJoinabilityIssue[]
{
  const leftRows = rows.filter((r) => r.source === leftSource);
  const rightRows = rows.filter((r) => r.source === rightSource);

  const issues = leftRows.flatMap((left): JoinabilityIssue[] => {
    const validMatches = rightRows.filter(
      (right) =>
        String(right.entity_id) === String(left.entity_id) &&
        closedDateIntervalsOverlap(
          left.valid_from,
          left.valid_to,
          right.valid_from,
          right.valid_to
        )
    );

    const fullMatches = validMatches.filter((right) =>
      halfOpenTimestampIntervalsOverlap(
        left.visible_from,
        left.visible_to ?? "",
        right.visible_from,
        right.visible_to ?? ""
      )
    );

    if (fullMatches.length === 0) {
      const reason =
        validMatches.length > 0 ? "NO_VISIBLE_OVERLAP" : "NO_VALID_MATCH";

      return [
        {
          entity_id: left.entity_id,
          source: leftSource,
          targetSource: rightSource,
          valid_from: left.valid_from,
          valid_to: left.valid_to,
          visible_from: left.visible_from,
          visible_to: left.visible_to,
          type: "JOIN_GAP",
          matchingRows: 0,
          reason,
          message:
            reason === "NO_VISIBLE_OVERLAP"
              ? `Valid match exists, but no visible-time overlap with ${rightSource}`
              : `No valid-time match found in ${rightSource}`,
        },
      ];
    }

    if (fullMatches.length > 1) {
      return [
        {
          entity_id: left.entity_id,
          source: leftSource,
          targetSource: rightSource,
          valid_from: left.valid_from,
          valid_to: left.valid_to,
          visible_from: left.visible_from,
          visible_to: left.visible_to,
          type: "JOIN_AMBIGUITY",
          matchingRows: fullMatches.length,
          reason: "MULTIPLE_MATCHES",
          message: `${fullMatches.length} matching ${rightSource} rows found`,
        },
      ];
    }

    return [];
  });

  const groupedGaps = new Map<string, JoinabilityIssue[]>();

  issues.forEach((issue) => {
    if (issue.type !== "JOIN_GAP") return;

    const key = [
      issue.source,
      issue.targetSource,
      issue.reason,
      issue.valid_from,
      issue.valid_to,
    ].join("|");

    groupedGaps.set(key, [...(groupedGaps.get(key) || []), issue]);
  });

  const aggregatedGapKeys = new Set<string>();

  const aggregatedGaps: AggregatedJoinabilityIssue[] = Array.from(
    groupedGaps.entries()
  ).map(([key, group]) => {
    if (group.length === 1) {
      return group[0];
    }

    aggregatedGapKeys.add(key);

    return {
      ...group[0],
      isAggregated: true,
      count: group.length,
      entityIds: group.map((g) => g.entity_id),
      entity_id: group[0].entity_id,
      message: `${group.length} entities have the same join gap pattern`,
    };
  });

  const nonGapIssues = issues.filter((issue) => issue.type !== "JOIN_GAP");

  return [...aggregatedGaps, ...nonGapIssues];
}