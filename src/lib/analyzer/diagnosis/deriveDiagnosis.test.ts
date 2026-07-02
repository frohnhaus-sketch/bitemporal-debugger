import { describe, expect, it } from "vitest";
import { deriveDiagnosis } from "./deriveDiagnosis";
import type { TargetFinding } from "@/lib/types";

describe("deriveDiagnosis", () => {
  it("returns CLEAN when there are no findings", () => {
    const result = deriveDiagnosis([]);

    expect(result.decision).toBe("clean");
  });

  it("returns PARTIALLY_REPRODUCIBLE for medium findings", () => {
    const findings: TargetFinding[] = [
      {
        id: "gap",
        title: "Gap",
        severity: "medium",
        evidence: [],
        recommendation: "",
      },
    ];

    const result = deriveDiagnosis(findings);

    expect(result.decision).toBe("partially_reproducible");
  });

  it("returns NOT_REPRODUCIBLE for high findings", () => {
    const findings: TargetFinding[] = [
      {
        id: "overlap",
        title: "Overlap",
        severity: "high",
        evidence: [],
        recommendation: "",
      },
    ];

    const result = deriveDiagnosis(findings);

    expect(result.decision).toBe("not_reproducible");
  });
});