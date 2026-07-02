import { describe, expect, it } from "vitest";
import { analyzeTargetTable } from "@/lib/targetTableValidator";

function findingIds(
  csv: string,
  semantics: Parameters<typeof analyzeTargetTable>[1] = {},
) {
  return analyzeTargetTable(csv, semantics).result.findings.map((f) => f.id);
}

describe("Target Table Validator", () => {
  it("detects valid-time overlaps", () => {
    const csv = `Identity_ID,BK_VALID_FROM,BK_VALID_TO
1001,2025-02-15,2025-05-15
1001,2025-03-15,9999-12-31`;

    expect(findingIds(csv)).toContain("valid-time-overlaps");
  });

  it("detects valid-time gaps", () => {
    const csv = `Identity_ID,BK_VALID_FROM,BK_VALID_TO
1001,2025-02-15,2025-03-15
1001,2025-04-15,9999-12-31`;

    expect(findingIds(csv)).toContain("valid-time-gaps");
  });

  it("allows touching intervals when valid_to is exclusive", () => {
    const csv = `Identity_ID,BK_VALID_FROM,BK_VALID_TO
1001,2025-02-15,2025-03-15
1001,2025-03-15,9999-12-31`;

    expect(
      findingIds(csv, {
        validIntervalEnd: "exclusive",
      }),
    ).not.toContain("valid-time-overlaps");
  });

  it("detects touching intervals as overlap when valid_to is inclusive", () => {
    const csv = `Identity_ID,BK_VALID_FROM,BK_VALID_TO
1001,2025-02-15,2025-03-15
1001,2025-03-15,9999-12-31`;

    expect(
      findingIds(csv, {
        validIntervalEnd: "inclusive",
      }),
    ).toContain("valid-time-overlaps");
  });

  it("detects invalid intervals", () => {
    const csv = `Identity_ID,BK_VALID_FROM,BK_VALID_TO
1001,2025-05-15,2025-02-15`;

    expect(findingIds(csv)).toContain("invalid-valid-time-intervals");
  });

  it("detects bitemporal valid overlap", () => {
    const csv = `Identity_ID,BK_VALID_FROM,BK_VALID_TO,BK_VISIBLE_FROM,BK_VISIBLE_TO
1001,2025-02-15,2025-05-15,2025-02-15,9999-12-31
1001,2025-03-15,9999-12-31,2025-05-15,9999-12-31`;

    expect(findingIds(csv)).toContain("valid-time-overlaps");
  });

  it("requires a business key", () => {
    const csv = `BK_VALID_FROM,BK_VALID_TO,Amount
2025-01-01,2025-02-01,100
2025-02-01,9999-12-31,120`;

    const analysis = analyzeTargetTable(csv);
    const { result } = analysis;

    expect(result.detectedColumns.businessKey).toBeFalsy();
    expect(result.findings.map((f) => f.id)).toContain("missing-business-key");
  });

  it("requires valid-time columns", () => {
    const csv = `Identity_ID,Status
1001,Active`;

    expect(findingIds(csv)).toContain("missing-valid-time");
  });

  it("detects BK style columns", () => {
    const csv = `Identity_ID,BK_VALID_FROM,BK_VALID_TO,BK_VISIBLE_FROM,BK_VISIBLE_TO
1001,2025-01-01,9999-12-31,2025-01-01,9999-12-31`;

    const analysis = analyzeTargetTable(csv);
    const { result } = analysis;

    expect(result.detectedColumns.businessKey).toBeTruthy();
    expect(result.detectedColumns.validFrom).toBeTruthy();
    expect(result.detectedColumns.validTo).toBeTruthy();
    expect(result.detectedColumns.visibleFrom).toBeTruthy();
    expect(result.detectedColumns.visibleTo).toBeTruthy();
  });

  it("returns no findings for a clean history", () => {
    const csv = `Identity_ID,BK_VALID_FROM,BK_VALID_TO
1001,2025-01-01,2025-02-01
1001,2025-02-01,9999-12-31`;

    expect(findingIds(csv)).toEqual([]);
  });

  it("detects duplicate valid-time intervals", () => {
    const csv = `Identity_ID,BK_VALID_FROM,BK_VALID_TO
1001,2025-01-01,2025-02-01
1001,2025-01-01,2025-02-01`;

    expect(findingIds(csv)).toContain("duplicate-valid-intervals");
  });

  it("detects snapshot reproducibility risk", () => {
    const csv = `Identity_ID,snapshot_date,generation_method
1001,2025-01-31,current_rebuild_only`;

    expect(findingIds(csv)).toContain("snapshot-reproducibility-risk");
  });

  it("detects coverage gap risk marker", () => {
    const csv = `Identity_ID,BK_VALID_FROM,BK_VALID_TO,coverage_status
1001,2025-01-01,2025-02-01,coverage_gap`;

    expect(findingIds(csv)).toContain("historical-coverage-gap-risk");
  });

  it("detects state reduction risk marker", () => {
    const csv = `Identity_ID,BK_VALID_FROM,BK_VALID_TO,reduction_status
1001,2025-01-01,2025-02-01,not_reduced`;

    expect(findingIds(csv)).toContain("state-reduction-risk");
  });

  it("detects event prioritization risk marker", () => {
    const csv = `event_id,event_time,event_type,prioritization_status
E1,2025-01-01,STATUS_CHANGE,not_prioritized`;

    expect(findingIds(csv)).toContain("event-prioritization-risk");
  });
});
