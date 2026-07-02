import type { InvestigationReport } from "./types";

export const reproducibilityReport: InvestigationReport = {
  title: "Historical output is not reproducible",

  executiveSummary:
    "The analyzer found strong evidence that historical reports generated from this table cannot be reproduced reliably in the future.",

  rootCause:
    "Historical corrections overwrite information that previous reports depended on.",

  businessImpact:
    "Previously published reports may change when rebuilt. Financial and regulatory reporting can become inconsistent.",

  recommendation:
    "Separate published reporting history from corrected business history, or preserve visible-time history.",

  nextSteps: [
    "Review snapshot semantics.",
    "Review visible-time semantics.",
    "Validate historical rebuilds.",
    "Preserve published reporting states.",
  ],
};