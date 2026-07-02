import type { TargetValidationResult } from "@/lib/types";

import { deriveModelFacts } from "@/lib/analyzer/facts/deriveFacts";
import { deriveDiagnosis } from "@/lib/analyzer/diagnosis/deriveDiagnosis";
import { derivePresentation } from "@/lib/analyzer/presentation/derivePresentation";
import { detectProblems } from "@/lib/analyzer/problems/detectProblems";
import { rankProblems } from "@/lib/analyzer/problems/rankProblems";

export function deriveInvestigation(result: TargetValidationResult) {
  const modelFacts = deriveModelFacts(result);
  const ruleFacts = {};

  const problems = rankProblems(
    detectProblems(modelFacts, ruleFacts, result.findings),
  );

  const primaryProblem = problems[0] ?? null;

  const diagnosis = deriveDiagnosis(modelFacts, ruleFacts, result.findings);
  const presentation = derivePresentation(diagnosis);

  return {
    modelFacts,
    ruleFacts,
    problems,
    primaryProblem,
    diagnosis,
    presentation,
  };
}