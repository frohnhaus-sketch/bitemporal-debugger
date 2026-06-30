import type { InvestigationStep } from "./investigationTypes";

export const targetTableReportReproducibilityTimeline: InvestigationStep[] = [
  {
    id: "understand-table",
    label: "Understanding target table",
    detail: "Reading the uploaded structure and detected semantics.",
  },
  {
    id: "detect-entities",
    label: "Detecting business entities",
    detail: "Looking for stable business keys and reporting grains.",
  },
  {
    id: "detect-time",
    label: "Looking for historical intervals",
    detail: "Checking valid time, visible time and snapshot signals.",
  },
  {
    id: "reporting-strategy",
    label: "Checking reporting strategy",
    detail: "Evaluating whether the table can support historical reconstruction.",
  },
  {
    id: "consistency",
    label: "Reviewing historical consistency",
    detail: "Inspecting overlaps, gaps, duplicate periods and reproducibility risks.",
  },
  {
    id: "conclusion",
    label: "Building investigation conclusion",
    detail: "Summarizing the evidence into an actionable decision.",
  },
];