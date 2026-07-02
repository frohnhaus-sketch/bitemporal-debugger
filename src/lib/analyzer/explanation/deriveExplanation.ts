import type { InvestigationDiagnosis } from "@/lib/analyzer/diagnosis/types";
import type { InvestigationExplanation } from "./types";

function explainFinding(id: string) {
  switch (id) {
    case "snapshot-reproducibility-risk":
      return {
        title: "Snapshot reproducibility risk detected",
        body:
          "The same reporting date may not rebuild to the same output because historical versions can change after publication.",
        findingId: id,
      };

    case "coverage-gap-risk":
    case "valid-time-gaps":
      return {
        title: "Historical timeline contains missing periods",
        body:
          "The analyzer found periods where no valid state exists. Reports for those periods may silently omit business entities.",
        findingId: id,
      };

    case "valid-time-overlaps":
      return {
        title: "Conflicting historical states detected",
        body:
          "Multiple records are valid for the same business entity during the same time interval. Consumers cannot reliably determine which state was in effect.",
        findingId: id,
      };

    default:
      return {
        title: id,
        body:
          "This technical signal contributed to the investigation result and should be reviewed before publishing historical reports.",
        findingId: id,
      };
  }
}

export function deriveExplanation(
  diagnosis: InvestigationDiagnosis,
): InvestigationExplanation {
  const evidenceItems = diagnosis.evidence.map((finding) =>
    explainFinding(finding.id),
  );

  if (diagnosis.decision === "not_reproducible") {
    return {
      claim:
        "Historical reports generated from this dataset are unlikely to be reproducible.",
      decision: diagnosis.decision,
      confidence: diagnosis.confidence,

      verdict: {
        title: "Verdict",
        body:
          "The analyzer found strong evidence that this historical output cannot be reproduced consistently. Temporal consistency violations indicate that rebuilding historical reports may produce different business results than previously published versions.",
      },

      evidence: {
        title: "Why we believe this",
        intro:
          "The following signals contributed directly to this investigation result.",
        items: evidenceItems,
      },

      businessImpact: {
        title: "Business Impact",
        body:
          "Published reports may no longer match future rebuilds. Historical KPIs can change unexpectedly, and auditability is reduced because the dataset does not clearly preserve what was known at reporting time.",
      },

      recommendedAction: {
        title: "Recommended Action",
        body:
          "Do not publish or rely on this historical output until the temporal inconsistencies have been reviewed. Start with the evidence listed above, then verify correction handling, interval boundaries, and snapshot reproducibility.",
      },

      nextSteps: [
        "Review the evidence signals that contributed to the claim.",
        "Check whether historical corrections are modeled explicitly.",
        "Validate interval boundaries and missing coverage periods.",
        "Re-run the analyzer after fixing the underlying table.",
      ],

      technicalEvidence: diagnosis.evidence,
    };
  }

  return {
    claim: "No critical historical reproducibility claim was established.",
    decision: diagnosis.decision,
    confidence: diagnosis.confidence,

    verdict: {
      title: "Verdict",
      body:
        "The analyzer did not find enough evidence to claim that this output is not reproducible.",
    },

    evidence: {
      title: "Why we believe this",
      intro: "The current investigation did not produce critical evidence.",
      items: evidenceItems,
    },

    businessImpact: {
      title: "Business Impact",
      body:
        "No immediate business reporting blocker was detected, but the dataset should remain covered by analyzer checks.",
    },

    recommendedAction: {
      title: "Recommended Action",
      body:
        "Keep this table under automated historical quality checks and re-run the analyzer after upstream model changes.",
    },

    nextSteps: [
      "Document the detected business key and time columns.",
      "Keep this table covered by analyzer checks.",
      "Re-run the analyzer after upstream model changes.",
    ],

    technicalEvidence: diagnosis.evidence,
  };
}