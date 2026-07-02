import type { TargetValidationResult } from "@/lib/types";
import type { RuleFacts } from "@/lib/analyzer/rules/types";

import { deriveModelFacts } from "@/lib/analyzer/facts/deriveFacts";
import { deriveDiagnosis } from "@/lib/analyzer/diagnosis/deriveDiagnosis";
import { derivePresentation } from "@/lib/analyzer/presentation/derivePresentation";

import type { AnalyzerContext } from "./types";

export function createAnalyzerContext(
  result: TargetValidationResult,
  ruleFacts: RuleFacts = {},
): AnalyzerContext {
  const modelFacts = deriveModelFacts(result);

  const diagnosis = deriveDiagnosis(modelFacts, ruleFacts, result.findings);
  const presentation = derivePresentation(diagnosis);

  return {
    result,
    modelFacts,
    ruleFacts,
    diagnosis,
    presentation,
  };
}
