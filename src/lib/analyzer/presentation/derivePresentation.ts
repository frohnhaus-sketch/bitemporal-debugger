import type { InvestigationDiagnosis } from "../diagnosis/types";
import type { InvestigationPresentation } from "./types";

import { reports } from "@/lib/analyzer/reports";

export function derivePresentation(
  diagnosis: InvestigationDiagnosis,
): InvestigationPresentation {
  if (diagnosis.decision === "not_reproducible") {
    const report = reports["historical-output-not-reproducible"];

    return {
      title: report.title,
      subtitle: report.executiveSummary,
      consequences: [
        report.businessImpact,
      ],
      rootCause: report.rootCause,
      businessImpact: report.businessImpact,
      recommendation: report.recommendation,
      nextSteps: report.nextSteps,
    };
  }

  switch (diagnosis.decision) {
    case "clean":
      return {
        title: "No critical historical risks detected.",
        subtitle:
          "The analyzer found no critical historical consistency issues.",
        consequences: [
          "No critical interval problems were detected.",
          "Historical reports should remain reproducible.",
          "No immediate publishing blocker was found.",
        ],
        rootCause:
          "No overlaps, invalid intervals or reproducibility risks were detected.",
        businessImpact: "Historical reports should remain reproducible.",
        recommendation: "No immediate action is required.",
        nextSteps: [
          "Keep this table covered by analyzer checks.",
          "Re-run the analyzer after upstream model changes.",
          "Document the detected business key and time columns.",
        ],
      };

    case "partially_reproducible":
      return {
        title: "Reports may change after historical rebuilds.",
        subtitle:
          "The table contains historical quality issues that can make regenerated results unstable.",
        consequences: [
          "Historical rebuilds may produce different results.",
          "Temporal joins may duplicate or miss rows.",
          "Reports should be reviewed before publishing.",
        ],
        rootCause:
          "One or more temporal consistency checks produced warnings.",
        businessImpact:
          "Future historical rebuilds may produce different business results.",
        recommendation:
          "Review the reported findings before publishing historical data.",
        nextSteps: [
          "Keep this table covered by analyzer checks.",
          "Re-run the analyzer after upstream model changes.",
          "Document the detected business key and time columns.",
        ],
      };

    case "review":
      return {
        title: "Additional review recommended.",
        subtitle:
          "The analyzer could not establish a reliable historical model.",
        consequences: [
          "Historical correctness cannot be verified reliably.",
          "Required time or key metadata may be missing.",
          "The table needs clarification before it can be trusted.",
        ],
        rootCause:
          "Required historical metadata is incomplete or ambiguous.",
        businessImpact:
          "Historical correctness cannot be verified reliably.",
        recommendation:
          "Complete the required model information and investigate the findings.",
        nextSteps: [
          "Keep this table covered by analyzer checks.",
          "Re-run the analyzer after upstream model changes.",
          "Document the detected business key and time columns.",
        ],
      };

    default:
      return {
        title: "No critical historical risks detected.",
        subtitle:
          "The analyzer found no critical historical consistency issues.",
        consequences: [],
        rootCause: "",
        businessImpact: "",
        recommendation: "",
        nextSteps: [],
      };
  }
}