import type { TargetFinding } from "@/lib/types";
import type { ModelFacts } from "@/lib/analyzer/facts/types";
import type { RuleFacts } from "@/lib/analyzer/rules/types";
import type { ProblemCandidate } from "./types";

import { conflictingHistoryKnowledge } from "@/lib/analyzer/knowledge/conflictingHistory";
import { evaluateKnowledge } from "./evaluateKnowledge";
import {
  confidenceFromScore,
  evidenceIds,
  sumEvidenceScore,
} from "./scoring";

export function detectConflictingHistoryProblem(
  modelFacts: ModelFacts,
  ruleFacts: RuleFacts,
  findings: TargetFinding[],
): ProblemCandidate | null {
  const activeEvidenceIds: string[] = [];

  if (modelFacts.hasBusinessKey) activeEvidenceIds.push("business_key_detected");
  if (modelFacts.hasValidTime) activeEvidenceIds.push("valid_time_detected");

  if (ruleFacts.hasTemporalAmbiguity) {
    activeEvidenceIds.push("temporal_ambiguity");
  }

  if (ruleFacts.hasDuplicateIntervals) {
    activeEvidenceIds.push("duplicate_intervals");
  }

  if ((ruleFacts.validTimeOverlapCount ?? 0) > 0) {
    activeEvidenceIds.push("valid_time_overlaps");
  }

  if ((ruleFacts.duplicateSnapshotGrainCount ?? 0) > 0) {
    activeEvidenceIds.push("duplicate_snapshot_grain");
  }

  const evidenceContributions = evaluateKnowledge(
    conflictingHistoryKnowledge,
    activeEvidenceIds,
  );

  const score = sumEvidenceScore(evidenceContributions);

  if (!modelFacts.hasBusinessKey || !modelFacts.hasValidTime) return null;
  if (score < 45) return null;

  const relatedFindings = findings.filter((finding) =>
    [
      "valid-time-overlaps",
      "duplicate-intervals",
      "snapshot-duplicates",
    ].includes(finding.id),
  );

  return {
    id: conflictingHistoryKnowledge.id,
    severity: conflictingHistoryKnowledge.severity,
    confidence: confidenceFromScore(score),
    evidence: evidenceIds(evidenceContributions),
    evidenceContributions,
    findings: relatedFindings,
  };
}