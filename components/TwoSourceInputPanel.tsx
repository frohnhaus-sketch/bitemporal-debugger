type TwoSourceInputPanelProps = {
  inputA: string;
  inputB: string;
  setInputA: (v: string) => void;
  setInputB: (v: string) => void;
  sourceNameA: string;
  sourceNameB: string;
  setSourceNameA: (v: string) => void;
  setSourceNameB: (v: string) => void;
  onAnalyze: () => void;
  onLoadExample: () => void;
  onCopyAtoB: () => void;
  controls?: React.ReactNode;
};

export function TwoSourceInputPanel({
  inputA,
  inputB,
  setInputA,
  setInputB,
  sourceNameA,
  sourceNameB,
  setSourceNameA,
  setSourceNameB,
  onAnalyze,
  onLoadExample,
  onCopyAtoB,
  controls,
}: TwoSourceInputPanelProps) {
  return (
    <div style={{ marginBottom: 20 }}>
    
      <button
        onClick={onLoadExample}
        style={{
          margin: "0 0 12px",
          padding: "7px 12px",
          borderRadius: 8,
          border: "none",
          background: "#22c55e",
          color: "white",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          width: "fit-content",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Load Example
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        <div style={{ background: "#fff", padding: 16, borderRadius: 12 }}>
          <label style={{ fontSize: 12 }}>Source A name</label>
          <input
            value={sourceNameA}
            onChange={(e) => setSourceNameA(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />

          <textarea
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            placeholder="Paste Source A query result"
            style={{
              width: "100%",
              height: 140,
              fontFamily: "monospace",
              padding: 10,
            }}
          />
        </div>

        <div style={{ background: "#fff", padding: 16, borderRadius: 12 }}>
          <label style={{ fontSize: 12 }}>Source B name</label>
          <input
            value={sourceNameB}
            onChange={(e) => setSourceNameB(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />

          <textarea
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            placeholder="Paste Source B query result"
            style={{
              width: "100%",
              height: 140,
              fontFamily: "monospace",
              padding: 10,
            }}
          />

          <button
            onClick={onCopyAtoB}
            style={{
              marginTop: 8,
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Copy Source A → B
          </button>
        </div>
      </div>

    {controls}

      <button
        onClick={() => {
          if (!inputA.trim() || !inputB.trim()) return;
          onAnalyze();
        }}
        disabled={!inputA.trim() || !inputB.trim()}
        style={{
          marginTop: 12,
          padding: "12px 18px",
          borderRadius: 10,
          background: "#2563eb",
          color: "white",
          border: "none",
          fontWeight: 600,
          fontSize: 14,
          cursor: !inputA.trim() || !inputB.trim() ? "not-allowed" : "pointer",
          opacity: !inputA.trim() || !inputB.trim() ? 0.5 : 1,
          boxShadow: !inputA.trim() || !inputB.trim()
            ? "none"
            : "0 4px 14px rgba(37, 99, 235, 0.35)",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          if (inputA.trim() && inputB.trim()) {
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Analyze differences
      </button>

      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
        Debugging a self-join? Paste the same table in both fields.
      </p>
    </div>
  );
}