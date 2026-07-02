import type { TargetFinding } from "@/lib/types";
import type { ModelFacts } from "@/lib/analyzer/facts/types";
import type { RuleFacts } from "@/lib/analyzer/rules/types";
import type { ProblemCandidate } from "./types";

import { missingTimelineKnowledge } from "@/lib/analyzer/knowledge/missingTimeline";
import { evaluateKnowledge } from "./evaluateKnowledge";
import {
  confidenceFromScore,
  evidenceIds,
  sumEvidenceScore,
} from "./scoring";

export function detectMissingTimelineProblem(
  modelFacts: ModelFacts,
  ruleFacts: RuleFacts,
  findings: TargetFinding[],
): ProblemCandidate | null {
  const activeEvidenceIds: string[] = [];

  if (modelFacts.hasBusinessKey) activeEvidenceIds.push("business_key_detected");
  if (modelFacts.hasValidTime) activeEvidenceIds.push("valid_time_detected");
  if (modelFacts.hasSnapshot) activeEvidenceIds.push("snapshot_detected");

  if (ruleFacts.hasCoverageProblem) {
    activeEvidenceIds.push("coverage_problem");
  }

  if ((ruleFacts.validTimeGapCount ?? 0) > 0) {
    activeEvidenceIds.push("valid_time_gaps");
  }

  if ((ruleFacts.snapshotCoverageGapCount ?? 0) > 0) {
    activeEvidenceIds.push("snapshot_coverage_gaps");
  }

  if (ruleFacts.hasSnapshotCoverageGap) {
    activeEvidenceIds.push("snapshot_coverage_gap_detected");
  }

  const evidenceContributions = evaluateKnowledge(
    missingTimelineKnowledge,
    activeEvidenceIds,
  );

  const score = sumEvidenceScore(evidenceContributions);

  if (!modelFacts.hasBusinessKey) return null;
  if (score < 40) return null;

  const relatedFindings = findings.filter((finding) =>
    [
      "valid-time-gaps",
      "coverage-gap-risk",
      "missing-snapshot-coverage",
      "monthly-snapshot-gaps",
    ].includes(finding.id),
  );

  return {
    id: missingTimelineKnowledge.id,
    severity: missingTimelineKnowledge.severity,
    confidence: confidenceFromScore(score),
    evidence: evidenceIds(evidenceContributions),
    evidenceContributions,
    findings: relatedFindings,
  };
}