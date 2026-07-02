import { describe, expect, it } from "vitest";
import { derivePresentation } from "./derivePresentation";

describe("derivePresentation", () => {
  it("creates clean presentation", () => {
    const p = derivePresentation({
      decision: "clean",
      confidence: "high",
      evidence: [],
    });

    expect(p.title).toContain("No critical");
  });

  it("creates not reproducible presentation", () => {
    const p = derivePresentation({
      decision: "not_reproducible",
      confidence: "high",
      evidence: [],
    });

    expect(p.title).toContain("cannot be reproduced");
  });
});