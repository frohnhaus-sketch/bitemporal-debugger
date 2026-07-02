import type { TargetFinding } from "@/lib/types";

export type InvestigationDiagnosis = {
  decision:
    | "clean"
    | "partially_reproducible"
    | "review"
    | "not_reproducible";
  confidence: "low" | "medium" | "high";
  evidence: TargetFinding[];
};

export type InvestigationDecision =
  | "clean"
  | "review"
  | "partially_reproducible"
  | "not_reproducible";

export type InvestigationConfidence =
  | "low"
  | "medium"
  | "high";
