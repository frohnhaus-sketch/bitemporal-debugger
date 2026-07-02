import type { TargetFinding } from "@/lib/types";
import type { KnowledgeSeverity } from "@/lib/analyzer/knowledge/types";

export type ProblemSeverity = KnowledgeSeverity;

export type EvidenceContribution = {
  id: string;
  score: number;
  reason: string;
};

export type ProblemCandidate = {
  id: string;
  severity: ProblemSeverity;
  confidence: number;
  evidence: string[];
  evidenceContributions: EvidenceContribution[];
  findings: TargetFinding[];
};