import type { BitemporalRow, JoinabilityIssue } from "./types";
import {
  closedDateIntervalsOverlap,
  halfOpenTimestampIntervalsOverlap,
} from "./dates";

export function analyzeJoinability(
  rows: BitemporalRow[],
  leftSource: string,
  rightSource: string
): JoinabilityIssue[] {
  const leftRows = rows.filter((r) => r.source === leftSource);
  const rightRows = rows.filter((r) => r.source === rightSource);

  return leftRows.flatMap((left): JoinabilityIssue[] => {
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
}