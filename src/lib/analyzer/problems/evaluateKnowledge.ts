import type { KnowledgeDefinition } from "@/lib/analyzer/knowledge/types";
import type { EvidenceContribution } from "./types";

export function evaluateKnowledge(
  knowledge: KnowledgeDefinition,
  activeEvidenceIds: string[],
): EvidenceContribution[] {
  const activeEvidence = new Set(activeEvidenceIds);

  return knowledge.evidence
    .filter((evidence) => activeEvidence.has(evidence.id))
    .map((evidence) => ({
      id: evidence.id,
      score: evidence.weight,
      reason: evidence.reason,
    }));
}