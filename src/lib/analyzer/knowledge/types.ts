export type KnowledgeSeverity = "critical" | "high" | "medium" | "low";

export type KnowledgeEvidence = {
  id: string;
  weight: number;
  reason: string;
};

export type KnowledgeDefinition = {
  id: string;
  severity: KnowledgeSeverity;
  title: string;
  businessImpact: string;
  recommendation: string;
  evidence: KnowledgeEvidence[];
};