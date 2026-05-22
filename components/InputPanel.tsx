import type { ValidationMode } from "@/lib/types";
import { track } from "@vercel/analytics";

type InputPanelProps = {
  input: string;
  setInput: (value: string) => void;
  onAnalyze: () => void;
  onLoadExample: () => void;
  validationMode: ValidationMode;
  setValidationModeAndAnalyze: (mode: ValidationMode) => void;
  sourceA: string;
  sourceB: string;
  availableSources: string[];
  setSourceAAndAnalyze: (source: string) => void;
  setSourceBAndAnalyze: (source: string) => void;
  asOfDate: string;
  setAsOfDate: (value: string) => void;
  visibleAsOf: string;
  setVisibleAsOf: (value: string) => void;
  resetDates: () => void;
  generateSQL: () => void;
};

export function InputPanel({
  input,
  setInput,
  onAnalyze,
  onLoadExample,
  validationMode,
  setValidationModeAndAnalyze,
  sourceA,
  sourceB,
  availableSources,
  setSourceAAndAnalyze,
  setSourceBAndAnalyze,
  asOfDate,
  setAsOfDate,
  visibleAsOf,
  setVisibleAsOf,
  resetDates,
  generateSQL,
}: InputPanelProps) {
  return (
    <>
      <button
        onClick={() => {
          track("Example Loaded");
          onLoadExample();
        }}
        style={{
          margin: "10px 0 20px",
          padding: "8px 14px",
          borderRadius: 8,
          border: "none",
          background: "#22c55e",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        Load Example
      </button>

      <div
        style={{
          background: "#ffffff",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
          border: "1px solid #1e293b",
          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        }}
      >
        <textarea
          style={{
            width: "100%",
            height: 150,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ddd",
            fontFamily: "monospace",
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="source,entity_id,value,valid_from,valid_to,visible_from,visible_to"
        />

        <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
          Expected columns: source, entity_id, value, valid_from, valid_to,
          visible_from, visible_to
        </p>

        <div
          style={{
            marginTop: 15,
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >

        <button
          onClick={() => {
            track("Analyze Clicked");
            onAnalyze();
          }}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#3b82f6",
            fontWeight: "bold",
            boxShadow: "0 4px 10px rgba(59,130,246,0.4)",
            color: "white",
            cursor: "pointer",
          }}
        >
          Analyze
        </button>

        <div>
          <label style={{ fontSize: 12 }}>Validation Mode</label>
          <br />
          <select
            value={validationMode}
            onChange={(e) =>
              setValidationModeAndAnalyze(e.target.value as ValidationMode)
            }
          >
            <option value="monotemporal">Valid time only</option>
            <option value="bitemporal">Valid + visible time</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12 }}>Source A</label>
          <br />
          <select
            value={sourceA}
            onChange={(e) => setSourceAAndAnalyze(e.target.value)}
          >
            <option value="">Auto</option>
            {availableSources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12 }}>Source B</label>
          <br />
          <select
            value={sourceB}
            onChange={(e) => setSourceBAndAnalyze(e.target.value)}
          >
            <option value="">Auto</option>
            {availableSources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12 }}>Valid As-of Date</label>
          <br />
          <input
            type="date"
            value={asOfDate || ""}
            onChange={(e) => setAsOfDate(e.target.value || "")}
          />
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
            Filters rows by valid time.
          </p>
        </div>

        <div>
          <label style={{ fontSize: 12 }}>Visible As-of Timestamp</label>
          <br />
          <input
            type="datetime-local"
            value={visibleAsOf || ""}
            onChange={(e) => setVisibleAsOf(e.target.value || "")}
          />
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
            Filters rows by visible/system time.
          </p>
        </div>

        <button
          onClick={resetDates}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #475569",
            background: "#1e293b",
            color: "#e2e8f0",
            cursor: "pointer",
          }}
        >
          Reset Dates
        </button>

        <button
          onClick={generateSQL}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            background: "#1e293b",
            color: "white",
            border: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            cursor: "pointer",
          }}
        >
          Generate SQL
        </button>
        </div>
      </div>
    </>
  );
}