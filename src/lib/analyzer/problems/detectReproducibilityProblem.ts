import type { TargetFinding } from "@/lib/types";
import type { ModelFacts } from "@/lib/analyzer/facts/types";
import type { RuleFacts } from "@/lib/analyzer/rules/types";
import type { ProblemCandidate } from "./types";

import { reproducibilityKnowledge } from "@/lib/analyzer/knowledge/reproducibility";
import { evaluateKnowledge } from "./evaluateKnowledge";
import {
  confidenceFromScore,
  evidenceIds,
  sumEvidenceScore,
} from "./scoring";

export function detectReproducibilityProblem(
  modelFacts: ModelFacts,
  ruleFacts: RuleFacts,
  findings: TargetFinding[],
): ProblemCandidate | null {
  const activeEvidenceIds: string[] = [];

  if (modelFacts.hasSnapshot) activeEvidenceIds.push("snapshot_detected");
  if (modelFacts.hasVisibleTime) activeEvidenceIds.push("visible_time_detected");

  if (ruleFacts.hasCriticalReproducibilityRisk) {
    activeEvidenceIds.push("critical_reproducibility_risk");
  }

  if (ruleFacts.hasCoverageProblem) {
    activeEvidenceIds.push("coverage_problem");
  }

  if (ruleFacts.hasSnapshotCoverageGap) {
    activeEvidenceIds.push("snapshot_coverage_gap");
  }

  const evidenceContributions = evaluateKnowledge(
    reproducibilityKnowledge,
    activeEvidenceIds,
  );

  const score = sumEvidenceScore(evidenceContributions);

  if (score < 35) return null;

  const relatedFindings = findings.filter((finding) =>
    [
      "snapshot-reproducibility-risk",
      "missing-snapshot-coverage",
      "monthly-snapshot-gaps",
      "coverage-gap-risk",
      "snapshot-duplicates",
    ].includes(finding.id),
  );

  return {
    id: reproducibilityKnowledge.id,
    severity: reproducibilityKnowledge.severity,
    confidence: confidenceFromScore(score),
    evidence: evidenceIds(evidenceContributions),
    evidenceContributions,
    findings: relatedFindings,
  };
}