import type { TargetValidationResult } from "@/lib/types";
import type { ModelFacts } from "@/lib/analyzer/facts/types";
import type { RuleFacts } from "@/lib/analyzer/rules/types";
import type { InvestigationDiagnosis } from "@/lib/analyzer/diagnosis/types";
import type { InvestigationPresentation } from "@/lib/analyzer/presentation/types";

export type AnalyzerContext = {
  result: TargetValidationResult;
  modelFacts: ModelFacts;
  ruleFacts: RuleFacts;
  diagnosis: InvestigationDiagnosis;
  presentation: InvestigationPresentation;
};