import type { EvidenceContribution } from "./types";

export function sumEvidenceScore(
  contributions: EvidenceContribution[],
): number {
  return contributions.reduce(
    (sum, contribution) => sum + contribution.score,
    0,
  );
}

export function confidenceFromScore(score: number): number {
  return Math.min(score / 100, 0.99);
}

export function evidenceIds(
  contributions: EvidenceContribution[],
): string[] {
  return contributions.map((contribution) => contribution.id);
}