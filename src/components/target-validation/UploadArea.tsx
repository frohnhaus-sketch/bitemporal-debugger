"use client";

import type React from "react";

export function UploadArea({
  input,
  onInputChange,
  onFileUpload,
  onRun,
  runLabel = "Run investigation",
}: {
  input: string;
  onInputChange: (value: string) => void;
  onFileUpload: (file: File | null) => void;
  onRun?: () => void;
  runLabel?: string;
}) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <label style={uploadLabelStyle}>Upload CSV</label>

      <input
        type="file"
        accept=".csv,text/csv,text/plain"
        onChange={(event) => {
          void onFileUpload(event.target.files?.[0] ?? null);
        }}
        style={{
          width: "100%",
          padding: 11,
          borderRadius: 12,
          background: "#ffffff",
          border: "1px solid #cbd5e1",
          boxSizing: "border-box",
          marginBottom: 14,
        }}
      />

      <label style={uploadLabelStyle}>Or paste table data</label>

      <textarea
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        placeholder="Paste table data here..."
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        style={{
          width: "100%",
          minHeight: 180,
          padding: 13,
          borderRadius: 12,
          border: "1px solid #cbd5e1",
          fontFamily: "monospace",
          fontSize: 13,
          lineHeight: 1.5,
          boxSizing: "border-box",
          resize: "vertical",
          background: "#ffffff",
        }}
      />

      {onRun && (
        <button
          type="button"
          onClick={onRun}
          disabled={!input.trim()}
          style={{
            marginTop: 14,
            width: "100%",
            border: "none",
            borderRadius: 12,
            padding: "12px 16px",
            background: input.trim() ? "#2563eb" : "#94a3b8",
            color: "#ffffff",
            fontWeight: 900,
            cursor: input.trim() ? "pointer" : "not-allowed",
            fontSize: 14,
          }}
        >
          {runLabel}
        </button>
      )}

      <p
        style={{
          margin: "12px 0 0",
          color: "#64748b",
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        Supported formats include CSV exports, copied SQL results, notebook
        output and other tabular text.
      </p>
    </div>
  );
}

const uploadLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 9,
  color: "#0f172a",
};