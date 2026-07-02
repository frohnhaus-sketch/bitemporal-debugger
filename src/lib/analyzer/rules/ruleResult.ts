import type { RuleFacts, RuleResult } from "./types";

export function ruleResult(
  result: RuleResult,
): RuleResult {
  return result;
}

export function emptyRuleResult(facts: RuleFacts = {}): RuleResult {
  return {
    findings: [],
    facts,
  };
}