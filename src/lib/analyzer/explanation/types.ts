import type { TargetFinding } from "@/lib/types";
import type {
  InvestigationConfidence,
  InvestigationDecision,
} from "@/lib/analyzer/diagnosis/types";

export type InvestigationExplanation = {
  claim: string;
  decision: InvestigationDecision;
  confidence: InvestigationConfidence;

  verdict: {
    title: string;
    body: string;
  };

  evidence: {
    title: string;
    intro: string;
    items: InvestigationEvidenceItem[];
  };

  businessImpact: {
    title: string;
    body: string;
  };

  recommendedAction: {
    title: string;
    body: string;
  };

  nextSteps: string[];

  technicalEvidence: TargetFinding[];
};

export type InvestigationEvidenceItem = {
  title: string;
  body: string;
  findingId?: string;
};