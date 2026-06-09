type Props = {
  validationContextRef: React.RefObject<HTMLDivElement | null>;
  guidedDemoStep: number | null;
  asOfDate: string;
  visibleAsOf: string;
  setAsOfDate: (value: string) => void;
  setVisibleAsOf: (value: string) => void;
  resetDates: () => void;
};

export function ValidationContextPanel({
  validationContextRef,
  guidedDemoStep,
  asOfDate,
  visibleAsOf,
  setAsOfDate,
  setVisibleAsOf,
  resetDates,
}: Props) {
  return (
    <div
      ref={validationContextRef}
      style={{
        scrollMarginTop: 96,
        width: "100%",
        boxSizing: "border-box",
        marginBottom: 18,
        marginTop: 18,
      }}
    >
      <details
        open={
          guidedDemoStep === 2 ||
          guidedDemoStep === 3 ||
          Boolean(asOfDate || visibleAsOf)
        }
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 14,
          color: "#0f172a",
          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 700,
            color: "#475569",
          }}
        >
          Validation Context
        </summary>

        <div style={{ marginTop: 12 }}>
          <div
            style={{
              fontSize: 14,
              color: "#64748b",
              lineHeight: 1.5,
              marginBottom: 12,
            }}
          >
            Validate the model at a specific historical point in time.
            Findings, timeline evidence and snapshot filters update automatically.
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div>
              <label style={{ fontSize: 12 }}>Valid As-of Date</label>
              <br />
              <input
                type="date"
                value={asOfDate || ""}
                onChange={(e) => setAsOfDate(e.target.value || "")}
              />
            </div>

            <div>
              <label style={{ fontSize: 12 }}>
                Visible As-of Timestamp
              </label>
              <br />
              <input
                type="datetime-local"
                value={visibleAsOf || ""}
                onChange={(e) => setVisibleAsOf(e.target.value || "")}
              />
            </div>

            <button
              type="button"
              onClick={resetDates}
              style={{
                padding: "9px 13px",
                borderRadius: 8,
                background: "#e2e8f0",
                color: "#334155",
                border: "1px solid #cbd5e1",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Reset Dates
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}