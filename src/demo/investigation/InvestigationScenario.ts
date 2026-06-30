export type InvestigationStepId =
  | "alert"
  | "mismatch"
  | "checks"
  | "join-checks"
  | "records"
  | "timeline"
  | "root-cause"
  | "impact";

export type InvestigationStep = {
  id: InvestigationStepId;
  label: string;
  time: string;
  status: string;
  description: string;
};

export const investigationSteps: InvestigationStep[] = [
  {
    id: "alert",
    label: "The alert",
    time: "08:14",
    status: "Incoming alert",
    description: "Finance reports a revenue mismatch overnight.",
  },
  {
    id: "mismatch",
    label: "Mismatch",
    time: "08:15",
    status: "Comparing reports",
    description: "Two reports disagree although no new orders arrived.",
  },
  {
    id: "checks",
    label: "Clean data",
    time: "08:16",
    status: "Running checks",
    description: "Basic quality checks do not explain the issue.",
  },
  {
    id: "join-checks",
    label: "Join checks",
    time: "08:17",
    status: "Checking joins",
    description: "Keys and matches still look valid.",
  },
  {
    id: "records",
    label: "Suspicious record",
    time: "08:18",
    status: "Inspecting record",
    description: "One order is matched to the wrong customer version.",
  },
  {
    id: "timeline",
    label: "Timeline",
    time: "08:19",
    status: "Replaying history",
    description: "The order happened before the customer upgrade.",
  },
  {
    id: "root-cause",
    label: "Root cause",
    time: "08:20",
    status: "Root cause found",
    description: "The join ignored historical validity.",
  },
  {
    id: "impact",
    label: "Impact",
    time: "08:21",
    status: "Impact calculated",
    description: "The incorrect join overstated revenue.",
  },
];