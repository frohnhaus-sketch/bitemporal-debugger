import type { TargetFinding } from "@/lib/types";
import type { ModelFacts } from "@/lib/analyzer/facts/types";
import type { RuleFacts } from "@/lib/analyzer/rules/types";
import type { InvestigationDiagnosis } from "./types";

import { detectProblems } from "@/lib/analyzer/problems/detectProblems";
import { rankProblems } from "@/lib/analyzer/problems/rankProblems";

function toDiagnosisConfidence(
  confidence: number,
): InvestigationDiagnosis["confidence"] {
  if (confidence >= 0.85) return "high";
  if (confidence >= 0.6) return "medium";
  return "low";
}

export function deriveDiagnosis(
  modelFacts: ModelFacts,
  ruleFacts: RuleFacts,
  findings: TargetFinding[],
): InvestigationDiagnosis {
  const problems = rankProblems(
    detectProblems(modelFacts, ruleFacts, findings),
  );

  const primaryProblem = problems[0];

  if (primaryProblem?.id === "historical-output-not-reproducible") {
    return {
      decision: "not_reproducible",
      confidence: toDiagnosisConfidence(primaryProblem.confidence),
      evidence: primaryProblem.findings,
    };
  }

  if (primaryProblem?.id === "business-history-contains-conflicting-states") {
    return {
      decision: "partially_reproducible",
      confidence: toDiagnosisConfidence(primaryProblem.confidence),
      evidence: primaryProblem.findings,
    };
  }

  if (primaryProblem?.id === "timeline-has-silent-missing-periods") {
    return {
      decision: "partially_reproducible",
      confidence: toDiagnosisConfidence(primaryProblem.confidence),
      evidence: primaryProblem.findings,
    };
  }

  if (ruleFacts.hasCriticalReproducibilityRisk) {
    return {
      decision: "not_reproducible",
      confidence: "high",
      evidence: findings,
    };
  }

  if (
    ruleFacts.hasCoverageProblem ||
    ruleFacts.hasTemporalAmbiguity ||
    ruleFacts.hasDuplicateIntervals ||
    ruleFacts.hasSnapshotCoverageGap
  ) {
    return {
      decision: "partially_reproducible",
      confidence: "medium",
      evidence: findings,
    };
  }

  if (!modelFacts.hasBusinessKey || !modelFacts.hasValidTime) {
    return {
      decision: "review",
      confidence: "medium",
      evidence: findings,
    };
  }

  return {
    decision: "clean",
    confidence: "high",
    evidence: findings,
  };
}
