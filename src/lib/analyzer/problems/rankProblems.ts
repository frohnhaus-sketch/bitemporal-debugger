import type { ProblemCandidate, ProblemSeverity } from "./types";

const severityScore: Record<ProblemSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function rankProblems(
  problems: ProblemCandidate[],
): ProblemCandidate[] {
  return [...problems].sort((a, b) => {
    const severityDelta = severityScore[b.severity] - severityScore[a.severity];

    if (severityDelta !== 0) return severityDelta;

    return b.confidence - a.confidence;
  });
}