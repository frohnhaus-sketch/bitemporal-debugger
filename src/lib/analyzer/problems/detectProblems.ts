import type { TargetFinding } from "@/lib/types";
import type { ModelFacts } from "@/lib/analyzer/facts/types";
import type { RuleFacts } from "@/lib/analyzer/rules/types";
import type { ProblemCandidate } from "./types";

import { detectReproducibilityProblem } from "./detectReproducibilityProblem";
import { detectConflictingHistoryProblem } from "./detectConflictingHistoryProblem";
import { detectMissingTimelineProblem } from "./detectMissingTimelineProblem";

export function detectProblems(
  modelFacts: ModelFacts,
  ruleFacts: RuleFacts,
  findings: TargetFinding[],
): ProblemCandidate[] {
  return [
    detectReproducibilityProblem(modelFacts, ruleFacts, findings),
    detectConflictingHistoryProblem(modelFacts, ruleFacts, findings),
    detectMissingTimelineProblem(modelFacts, ruleFacts, findings),
  ].filter((problem): problem is ProblemCandidate => problem !== null);
}