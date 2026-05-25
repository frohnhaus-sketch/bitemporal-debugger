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
  const canAnalyze = inputA.trim() && inputB.trim();

  return (
    <div style={{ marginBottom: 16 }}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onLoadExample}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #334155",
            background: "#020617",
            color: "#cbd5e1",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Load example
        </button>
        
        <button
          onClick={() => {
            if (!canAnalyze) return;
            onAnalyze();
          }}
          disabled={!canAnalyze}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            background: "#2563eb",
            color: "white",
            border: "none",
            fontWeight: 800,
            fontSize: 15,
            cursor: canAnalyze ? "pointer" : "not-allowed",
            opacity: canAnalyze ? 1 : 0.5,
            boxShadow: canAnalyze
              ? "0 10px 28px rgba(37,99,235,0.35)"
              : "none",
            transform: canAnalyze ? "scale(1.02)" : "none",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Analyze JOIN
        </button>
      </div>
        
      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: "#94a3b8",
        }}
      >
        Paste → Analyze → understand why the JOIN fails
      </p>
    </div>
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

      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8, }}>
        Debugging a self-join? Paste the same table in both fields.
      </p>
    </div>
  );
}