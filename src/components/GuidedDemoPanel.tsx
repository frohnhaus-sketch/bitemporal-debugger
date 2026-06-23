import { track } from "@/lib/analytics";

type Props = {
  guidedDemoStep: number | null;
  guidedDemoRef: React.RefObject<HTMLDivElement | null>;
  demoBeforeCount: number | null;
  activeMissingMatchCount: number;
  setDemoBeforeCount: (value: number | null) => void;
  setVisibleAsOf: (value: string) => void;
  setGuidedDemoStep: (value: number | null) => void;
  setPendingScrollTarget: (value: "snapshotActive" | null) => void;
  selectJoinIssue: (issue: null) => void;
  selectTemporalIssue: (issue: null) => void;
  setAsOfDate: (value: string) => void;
  setSql: (value: string) => void;
};

export function GuidedDemoPanel({
  guidedDemoStep,
  guidedDemoRef,
  demoBeforeCount,
  activeMissingMatchCount,
  setDemoBeforeCount,
  setVisibleAsOf,
  setGuidedDemoStep,
  setPendingScrollTarget,
  selectJoinIssue,
  selectTemporalIssue,
  setAsOfDate,
  setSql,
}: Props) {
  if (!guidedDemoStep) return null;

  return (
    <div
      ref={guidedDemoRef}
      style={{
        scrollMarginTop: 96,
        width: "100%",
        boxSizing: "border-box",
        minWidth: 0,
        overflowWrap: "anywhere",
        marginBottom: 16,
        padding: 14,
        borderRadius: 12,
        background: "#e0f2fe",
        border: "1px solid #38bdf8",
        color: "#075985",
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      {guidedDemoStep === 1 && (
        <>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            Guided Demo · Step 1 of 3
          </div>
          <div>
            This model looks broken at first: several source records cannot find
            a matching historical target row. The Missing Matches category is
            already selected. Now choose one concrete finding below to inspect
            the validation evidence.
          </div>
        </>
      )}

      {guidedDemoStep === 2 && (
        <>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            Guided Demo · Step 2 of 3
          </div>

          <div style={{ marginBottom: 10 }}>
            You selected a concrete finding. Now validate the same model from a
            later visible-time snapshot. Some findings may disappear when
            late-arriving records become visible.
          </div>

          <button
            type="button"
            onClick={() => {
              track("guided_demo_visibility_time_test");
              setDemoBeforeCount(activeMissingMatchCount);
              setVisibleAsOf("2025-01-02T00:00");
              setGuidedDemoStep(3);
              setPendingScrollTarget("snapshotActive");
              track("guided_demo_completed");
            }}
            style={{
              marginTop: 10,
              padding: "8px 12px",
              borderRadius: 8,
              background: "#0ea5e9",
              color: "#ffffff",
              border: "1px solid #38bdf8",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Use later visible-time
          </button>
        </>
      )}

      {guidedDemoStep === 3 && (
        <>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            Guided Demo · Step 3 of 3
          </div>

          <div style={{ fontWeight: 900, marginBottom: 8 }}>
            🎉 Aha Moment
          </div>

          <div
            style={{
              marginTop: 12,
              marginBottom: 12,
              padding: 12,
              borderRadius: 10,
              background: "#ffffff",
              border: "1px solid #86efac",
            }}
          >
            <div
              style={{
                color: "#b91c1c",
                marginBottom: 4,
                fontWeight: 800,
              }}
            >
              Before: {demoBeforeCount} Missing Matches were detected
            </div>

            <div style={{ color: "#166534", fontWeight: 800 }}>
              After: {activeMissingMatchCount} Missing Matches
            </div>
          </div>

          <div>
            This is snapshot drift: the same historical model produces a
            different validation result after switching to a later visible-time
            snapshot. The join was not necessarily broken. Some target rows were
            valid for the business period, but were not visible at the earlier
            snapshot.
          </div>

          <button
            type="button"
            onClick={() => {
              setGuidedDemoStep(null);
              selectJoinIssue(null);
              selectTemporalIssue(null);
              setAsOfDate("");
              setVisibleAsOf("");
              setSql("");
            }}
            style={{
              marginTop: 12,
              padding: "8px 12px",
              borderRadius: 8,
              background: "#0ea5e9",
              color: "#ffffff",
              border: "1px solid #38bdf8",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            End Demo
          </button>
        </>
      )}
    </div>
  );
}