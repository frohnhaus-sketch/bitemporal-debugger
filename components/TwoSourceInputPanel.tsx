import type React from "react";
import { ChangeEvent, useState } from "react";

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
  onCopyAtoB,
  controls,
  analysisModeControl,
}: TwoSourceInputPanelProps) {
  const canAnalyze = Boolean(inputA.trim() && inputB.trim());
  const [dragTarget, setDragTarget] = useState<string | null>(null);

  const featureCards = [
    {
      icon: "⌕",
      title: "Detect Historical Modeling Risks",
      text: "Identify gaps, overlaps and unstable temporal relationships.",
      bg: "#14532d",
      color: "#86efac",
    },
    {
      icon: "∞",
      title: "Identify Modeling Patterns",
      text: "Recognize late arriving dimensions, ambiguous history and snapshot risks.",
      bg: "#3b0764",
      color: "#d8b4fe",
    },
    {
      icon: "◷",
      title: "Understand Historical Behavior",
      text: "Learn how historized sources interact and why reporting may change over time.",
      bg: "#1e3a8a",
      color: "#bfdbfe",
    },
  ];

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
      placeholder: "Paste query results, Databricks display() output, Excel data or CSV/TSV... for Source A",
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
      placeholder: "Paste query results, Databricks display() output, Excel data or CSV/TSV... for Source B",
    },
  ];

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onLoadExample}
            style={{
              height: 56,
              minWidth: 230,
              padding: "0 24px",
              borderRadius: 12,
              border: "1px solid #15803d",
              background: "#16a34a",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(22,163,74,0.24)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>◎</span>
            Load demo dataset
          </button>

          <button
            onClick={() => {
              if (!canAnalyze) return;
              onAnalyze();
            }}
            disabled={!canAnalyze}
            style={{
              height: 56,
              minWidth: 230,
              padding: "0 24px",
              borderRadius: 12,
              background: canAnalyze ? "#1d4ed8" : "#1e293b",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.08)",
              fontWeight: 800,
              fontSize: 15,
              cursor: canAnalyze ? "pointer" : "not-allowed",
              opacity: canAnalyze ? 1 : 0.58,
              boxShadow: canAnalyze
                ? "0 8px 24px rgba(37,99,235,0.24)"
                : "none",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 22 }}>▷</span>
            Analyze Sources
          </button>

          <div
            style={{
              minWidth: 330,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {analysisModeControl}
          </div>
        </div>

        <div
          style={{
            fontSize: 15,
            color: "#cbd5e1",
            lineHeight: 1.5,
          }}
        >
          Upload two historized datasets and instantly{" "}
          <strong style={{ color: "#ffffff" }}>identify</strong>{" "}
          historical modeling risks, temporal join issues and source behavior patterns.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {featureCards.map((card) => (
            <div
              key={card.title}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                background: "#020617",
                boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
                border: "1px solid #1e293b",
                borderRadius: 12,
                padding: 20,
                minHeight: 112,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: card.bg,
                  color: card.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>

              <div>
                <div
                  style={{
                    color: "#e2e8f0",
                    fontSize: 15,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  {card.title}
                </div>

                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {card.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            marginBottom: "-10px",
            fontSize: 16,
            color: "#cbd5f5",
            fontWeight: 600,
          }}
        >
          Upload → Analyze → Identify Patterns → Validate Findings
        </p>
      </div>

        <div
          style={{
            marginTop: 10,
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #1e293b",
            background: "#020617",
            color: "#94a3b8",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "#cbd5e1" }}>🔒 Your data never leaves the browser.
Uploaded datasets remain in your session and are not stored.</strong>
        </div>

      <div
        style={{
          marginTop: 5,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 20,
        }}
      >
        {sources.map((source) => (
          <div
            key={source.label}
            style={{
              background: "#020617",
              border: "1px solid #334155",
              borderRadius: 16,
              padding: 18,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      border: `1px solid ${source.color}`,
                      color: source.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 14,
                    }}
                  >
                    {source.label}
                  </div>
                  
                  <div
                    style={{
                      color: source.color,
                      fontWeight: 900,
                      fontSize: 17,
                    }}
                  >
                    {source.title}
                  </div>
                </div>
                  
                {source.label === "B" && (
                  <button
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
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
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
                fontSize: 13,
                marginBottom: 6,
              }}
            >
              {source.title} name
            </label>

            <input
              value={source.name}
              onChange={(e) => source.setName(e.target.value)}
              style={{
                width: "100%",
                marginBottom: 12,
                padding: "11px 12px",
                borderRadius: 9,
                border: "1px solid #334155",
                background: "#020617",
                color: "#e2e8f0",
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragTarget(source.label);
              }}

              onDragLeave={() => {
                setDragTarget(null);
              }}

              onDrop={(e) => {
                e.preventDefault();
                setDragTarget(null);
              
                const file = e.dataTransfer.files?.[0];
              
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
                gap: 14,
                padding: 14,
                borderRadius: 12,
                border:
                  dragTarget === source.label
                    ? "2px solid #3b82f6"
                    : "1px solid #334155",
                background:
                  dragTarget === source.label
                    ? "#0f172a"
                    : "#020617",
                marginBottom: 12,
                transition: "all 0.15s ease",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  border: `1px solid ${source.color}`,
                  color: source.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                ⇧
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: 15,
                    marginBottom: 4,
                  }}
                >
                  {dragTarget === source.label
                    ? "Drop file here"
                    : "Upload CSV"}
                </div>

                {source.fileName ? (
                  <>
                    <div style={{ color: "#22c55e", fontSize: 12, lineHeight: 1.4 }}>
                      ✓ {source.fileName}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.4 }}>
                      Loaded successfully
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: 12,
                      lineHeight: 1.4,
                    }}
                  >
                    Drag & drop CSV, TSV or TXT files or click Browse.
                  </div>
                )}
              </div>

              <label
                style={{
                  padding: "8px 13px",
                  borderRadius: 8,
                  background: "#111827",
                  color: "#e2e8f0",
                  border: "1px solid #475569",
                  cursor: "pointer",
                  fontSize: 13,
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
              onChange={(e) => source.setInput(e.target.value)}
              placeholder={source.placeholder}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off"
              style={{
                fontSize: 12,
                whiteSpace: "pre",
                width: "100%",
                height: 140,
                fontFamily: "monospace",
                padding: 12,
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
                marginTop: 10,
                color: "#94a3b8",
                fontSize: 12,
              }}
            >
              Supported columns (auto-mapped): entity_id, value, valid_from, valid_to,
              [visible_from, visible_to]
            </div>
          </div>
        ))}
      </div>
      {controls}
      <div
        style={{
          marginTop: 12,
          marginBottom: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={() => {
            if (!canAnalyze) return;
            onAnalyze();
          }}
          disabled={!canAnalyze}
          style={{
            height: 52,
            minWidth: 260,
            padding: "0 24px",
            borderRadius: 12,
            background: canAnalyze ? "#1d4ed8" : "#1e293b",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.08)",
            fontWeight: 800,
            fontSize: 15,
            cursor: canAnalyze ? "pointer" : "not-allowed",
            opacity: canAnalyze ? 1 : 0.58,
            boxShadow: canAnalyze
              ? "0 8px 24px rgba(37,99,235,0.24)"
              : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>▷</span>
          Analyze Sources
        </button>
      </div>
    </div>
  );
}