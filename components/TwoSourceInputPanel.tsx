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
  analysisModeControl?: React.ReactNode;
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
  analysisModeControl,
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
            border: "1px solid #15803d",
            background: "#16a34a",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(22,163,74,0.25)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#15803d";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#16a34a";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Load temporal join demo
        </button>
        <button
          onClick={() => {
            if (!canAnalyze) return;
            onAnalyze();
          }}
          disabled={!canAnalyze}
          style={{
            padding: "16px 22px",
            borderRadius: 10,
            background: canAnalyze ? "#1d4ed8" : "#1e293b",
            color: "white",
            border: "1px solid rgba(255,255,255,0.08)",
            fontWeight: 700,
            fontSize: 15,
            cursor: canAnalyze ? "pointer" : "not-allowed",
            opacity: canAnalyze ? 1 : 0.55,
            boxShadow: canAnalyze
              ? "0 4px 14px rgba(37,99,235,0.18)"
              : "none",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!canAnalyze) return;
            e.currentTarget.style.background = "#2563eb";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}

          onMouseLeave={(e) => {
            if (!canAnalyze) return;
            e.currentTarget.style.background = "#1d4ed8";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Analyze Sources
        </button>
        {analysisModeControl}
      </div>
        
      <p
        style={{
          margin: "12px 0 0px",
          fontSize: 16,
          color: "#cbd5f5",
          fontWeight: 500,
        }}
      >
        Paste → Analyze → understand historical source behavior
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
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 13,
              color: "#93c5fd",
            }}          
          >
            Debugging a self-join? Paste the same table into Source A and Source B.
          </p>
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
    </div>
  );
}