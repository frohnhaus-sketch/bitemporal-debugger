import type { AnalyzerFacts } from "@/lib/analyzer/facts/types";
import type { RuleFacts } from "@/lib/analyzer/rules/types";

export function mergeRuleFacts(
  derivedFacts: AnalyzerFacts,
  ruleFacts?: RuleFacts,
): AnalyzerFacts {
  if (!ruleFacts) {
    return derivedFacts;
  }

  return {
    ...derivedFacts,
    ...ruleFacts,
  };
}