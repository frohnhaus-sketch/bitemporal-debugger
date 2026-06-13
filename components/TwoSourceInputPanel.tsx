import { ChangeEvent, useEffect, useState } from "react";

type TwoSourceInputPanelProps = {
  fileNameA: string;
  fileNameB: string;
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
  onLoadGuidedDemo: () => void;
  onCopyAtoB: () => void;
  controls?: React.ReactNode;
  analysisModeControl?: React.ReactNode;
  onUploadA: (event: ChangeEvent<HTMLInputElement>) => void;
  onUploadB: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function TwoSourceInputPanel({
  fileNameA,
  fileNameB,
  onUploadA,
  onUploadB,
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
  onLoadGuidedDemo,
  onCopyAtoB,
  controls,
  analysisModeControl,
}: TwoSourceInputPanelProps) {
  const canAnalyze = Boolean(inputA.trim() && inputB.trim());
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };

    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);

    return () => {
      window.removeEventListener("resize", updateIsMobile);
    };
  }, []);

  const sources = [
    {
      fileName: fileNameA,
      label: "A",
      title: "Source A",
      name: sourceNameA,
      setName: setSourceNameA,
      input: inputA,
      setInput: setInputA,
      upload: onUploadA,
      color: "#22c55e",
      placeholder:
        "Paste historized source, target table output, Databricks display(), SQL result grid, CSV or TSV...",
    },
    {
      fileName: fileNameB,
      label: "B",
      title: "Source B",
      name: sourceNameB,
      setName: setSourceNameB,
      input: inputB,
      setInput: setInputB,
      upload: onUploadB,
      color: "#3b82f6",
      placeholder:
        "Paste the second historized source, target table output, Databricks display(), SQL result grid, CSV or TSV...",
    },
  ];

  return (
    <div
      style={{
        marginBottom: 16,
        padding: isMobile ? "0 4px" : undefined,
      }}
    >
      <div
        style={{
          marginBottom: 16,
          padding: 14,
          borderRadius: 12,
          border: "1px solid #1e293b",
          background: "#0f172a",
          color: "#cbd5e1",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        Compare two historized datasets when you need row-level evidence for
        temporal joins, source-vs-target validation, SCD2 coverage or
        late-arriving history.
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <button
          type="button"
          onClick={onLoadGuidedDemo}
          style={secondaryButtonStyle("#0ea5e9", "#38bdf8")}
        >
          ▶ Guided Demo
        </button>

        <button
          type="button"
          onClick={onLoadExample}
          style={secondaryButtonStyle("#111827", "rgba(34,197,94,0.55)")}
        >
          🧪 Validate Example
        </button>

        <div
          style={{
            marginLeft: "auto",
            color: "#94a3b8",
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          Upload → Analyze → Inspect findings
        </div>
      </div>

      <div
        style={{
          marginBottom: 12,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #1e293b",
          background: "#020617",
          color: "#94a3b8",
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "#cbd5e1" }}>
          🔒 Uploaded datasets are processed locally in your browser and are not stored on our servers.
        </strong>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        {sources.map((source) => (
          <SourceInputCard
            key={source.label}
            source={source}
            dragTarget={dragTarget}
            setDragTarget={setDragTarget}
            onCopyAtoB={onCopyAtoB}
          />
        ))}
      </div>

      {controls}

      <div
        style={{
          marginTop: 14,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {analysisModeControl && (
          <div
            style={{
              minWidth: isMobile ? "100%" : 260,
            }}
          >
            {analysisModeControl}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (!canAnalyze) return;
            onAnalyze();
          }}
          disabled={!canAnalyze}
          style={{
            height: 52,
            width: isMobile ? "100%" : 320,
            padding: "0 22px",
            borderRadius: 12,
            background: canAnalyze
              ? "linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)"
              : "#1e293b",
            color: "#ffffff",
            border: canAnalyze
              ? "1px solid rgba(147,197,253,0.35)"
              : "1px solid rgba(255,255,255,0.08)",
            fontWeight: 800,
            fontSize: 15,
            cursor: canAnalyze ? "pointer" : "not-allowed",
            opacity: canAnalyze ? 1 : 0.58,
            boxShadow: canAnalyze
              ? "0 8px 24px rgba(37,99,235,0.22)"
              : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "all 0.18s ease",
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>▷</span>
          Analyze Sources
        </button>
      </div>
    </div>
  );
}

function SourceInputCard({
  source,
  dragTarget,
  setDragTarget,
  onCopyAtoB,
}: {
  source: {
    fileName: string;
    label: string;
    title: string;
    name: string;
    setName: (value: string) => void;
    input: string;
    setInput: (value: string) => void;
    upload: (event: ChangeEvent<HTMLInputElement>) => void;
    color: string;
    placeholder: string;
  };
  dragTarget: string | null;
  setDragTarget: (value: string | null) => void;
  onCopyAtoB: () => void;
}) {
  return (
    <div
      style={{
        background: "#020617",
        border: "1px solid #334155",
        borderRadius: 14,
        padding: 14,
        boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              border: `1px solid ${source.color}`,
              color: source.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 13,
            }}
          >
            {source.label}
          </div>

          <div
            style={{
              color: source.color,
              fontWeight: 900,
              fontSize: 16,
            }}
          >
            {source.title}
          </div>
        </div>

        {source.label === "B" && (
          <button
            type="button"
            title="Useful for self-join debugging"
            onClick={onCopyAtoB}
            style={{
              padding: "6px 9px",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#1e293b",
              color: "#e2e8f0",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 11,
              whiteSpace: "nowrap",
            }}
          >
            Copy A → B
          </button>
        )}
      </div>

      <label
        style={{
          display: "block",
          color: "#e2e8f0",
          fontSize: 12,
          marginBottom: 6,
        }}
      >
        Name
      </label>

      <input
        value={source.name}
        onChange={(event) => source.setName(event.target.value)}
        style={{
          width: "100%",
          marginBottom: 10,
          padding: "9px 10px",
          borderRadius: 8,
          border: "1px solid #334155",
          background: "#020617",
          color: "#e2e8f0",
          fontSize: 13,
          boxSizing: "border-box",
        }}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragTarget(source.label);
        }}
        onDragLeave={() => {
          setDragTarget(null);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragTarget(null);

          const file = event.dataTransfer.files?.[0];
          if (!file) return;

          const syntheticEvent = {
            target: {
              files: [file],
            },
          } as unknown as ChangeEvent<HTMLInputElement>;

          source.upload(syntheticEvent);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 12,
          borderRadius: 10,
          border:
            dragTarget === source.label
              ? "2px solid #3b82f6"
              : "1px solid #334155",
          background: dragTarget === source.label ? "#0f172a" : "#020617",
          marginBottom: 10,
          transition: "all 0.15s ease",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: `1px solid ${source.color}`,
            color: source.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          ⇧
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: "#ffffff",
              fontWeight: 900,
              fontSize: 13,
              marginBottom: 3,
            }}
          >
            {dragTarget === source.label ? "Drop file here" : "Upload or paste"}
          </div>

          {source.fileName ? (
            <div style={{ color: "#22c55e", fontSize: 12, lineHeight: 1.4 }}>
              ✓ {source.fileName}
            </div>
          ) : (
            <div
              style={{
                color: "#94a3b8",
                fontSize: 11,
                lineHeight: 1.4,
              }}
            >
              CSV, TSV or TXT
            </div>
          )}
        </div>

        <label
          style={{
            padding: "7px 11px",
            borderRadius: 8,
            background: "#111827",
            color: "#e2e8f0",
            border: "1px solid #475569",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          Browse
          <input
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={source.upload}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <textarea
        value={source.input}
        onChange={(event) => source.setInput(event.target.value)}
        placeholder={source.placeholder}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        style={{
          fontSize: 12,
          whiteSpace: "pre",
          width: "100%",
          height: 120,
          fontFamily: "monospace",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #334155",
          background: "#020617",
          color: "#e2e8f0",
          resize: "vertical",
          boxSizing: "border-box",
          lineHeight: 1.5,
        }}
      />

      <div
        style={{
          marginTop: 8,
          color: "#94a3b8",
          fontSize: 11,
          lineHeight: 1.4,
        }}
      >
        Auto-mapped columns: entity_id, value, valid_from, valid_to,
        visible_from, visible_to.
      </div>
    </div>
  );
}

function secondaryButtonStyle(background: string, border: string): React.CSSProperties {
  return {
    height: 40,
    padding: "0 13px",
    borderRadius: 10,
    background,
    border: `1px solid ${border}`,
    color: "#ffffff",
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };
}