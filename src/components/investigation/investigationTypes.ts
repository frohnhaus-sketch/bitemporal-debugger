import type { ReactNode } from "react";

export type InvestigationStepStatus = "pending" | "active" | "done";

export type InvestigationStep = {
  id: string;
  label: string;
  detail?: string;
};

export type InvestigationPlayerProps = {
  title: string;
  subtitle?: string;
  steps: InvestigationStep[];
  conclusion: ReactNode;
  evidence?: ReactNode;
  recommendations?: ReactNode;
  technicalDetails?: ReactNode;
  stepDurationMs?: number;
};