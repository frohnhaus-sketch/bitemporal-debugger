"use client";

import type React from "react";
import { track } from "@/lib/analytics";

type UploadAreaComponent = React.ComponentType<{
  input: string;
  onInputChange: (value: string) => void;
  onFileUpload: (file: File | null) => void;
}>;

type ReportActionsProps = {
  isSampleReport: boolean;
  showOwnTableUpload: boolean;
  ownTableDraft: string;
  onStartOwnTable: () => void;
  onOwnTableDraftChange: (value: string) => void;
  onFileUpload: (file: File | null) => void;
  onRunOwnTable: () => void;
  onRunAnother: () => void;
  UploadArea: UploadAreaComponent;
};

export function ReportActions({
  isSampleReport,
  showOwnTableUpload,
  ownTableDraft,
  onStartOwnTable,
  onOwnTableDraftChange,
  onFileUpload,
  onRunOwnTable,
  onRunAnother,
  UploadArea,
}: ReportActionsProps) {
  return (
    <>
      <ReportExportActions />

      {isSampleReport && (
        <ContinueWithOwnData
          showUpload={showOwnTableUpload}
          input={ownTableDraft}
          onStart={onStartOwnTable}
          onInputChange={onOwnTableDraftChange}
          onFileUpload={onFileUpload}
          onRun={onRunOwnTable}
          UploadArea={UploadArea}
        />
      )}

      <button
        type="button"
        onClick={onRunAnother}
        className="no-print"
        style={{
          marginTop: 12,
          border: "1px solid #cbd5e1",
          borderRadius: 12,
          padding: "12px 16px",
          background: "#ffffff",
          color: "#0f172a",
          fontWeight: 900,
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        Run another investigation
      </button>
    </>
  );
}

function ReportExportActions() {
  function handlePrint() {
    track("investigation_report_pdf_download_clicked", {
      method: "browser_print",
    });

    window.print();
  }

  return (
    <section
      className="no-print"
      style={{
        marginTop: 18,
        padding: 18,
        borderRadius: 18,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div>
        <div style={blueEyebrowStyle}>Export</div>

        <h3
          style={{
            margin: "4px 0 4px",
            fontSize: 20,
            color: "#0f172a",
          }}
        >
          Save Investigation Report
        </h3>

        <p
          style={{
            margin: 0,
            color: "#475569",
            fontSize: 14,
            lineHeight: 1.45,
          }}
        >
          Save this investigation as a PDF for review, sharing or follow-up
          work.
        </p>
      </div>

      <button
        type="button"
        onClick={handlePrint}
        style={{
          border: "none",
          borderRadius: 12,
          padding: "12px 16px",
          background: "#0f172a",
          color: "#ffffff",
          fontWeight: 900,
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        Save as PDF
      </button>
    </section>
  );
}

function ContinueWithOwnData({
  showUpload,
  input,
  onStart,
  onInputChange,
  onFileUpload,
  onRun,
  UploadArea,
}: {
  showUpload: boolean;
  input: string;
  onStart: () => void;
  onInputChange: (value: string) => void;
  onFileUpload: (file: File | null) => void;
  onRun: () => void;
  UploadArea: UploadAreaComponent;
}) {
  return (
    <section
      style={{
        marginTop: 18,
        padding: 22,
        borderRadius: 18,
        background: "#f8fafc",
        border: "1px solid #dbeafe",
      }}
    >
      <div style={blueEyebrowStyle}>Continue your investigation</div>

      <h3
        style={{
          margin: "0 0 8px",
          fontSize: 26,
          lineHeight: 1.1,
          letterSpacing: "-0.035em",
          color: "#0f172a",
        }}
      >
        Run this investigation on your own historical table
      </h3>

      <p
        style={{
          margin: "0 0 16px",
          maxWidth: 720,
          color: "#475569",
          fontSize: 15,
          lineHeight: 1.55,
        }}
      >
        The sample investigation is complete. Now upload your own CSV and
        investigate your own historical reporting output.
      </p>

      {!showUpload ? (
        <button
          type="button"
          onClick={onStart}
          style={{
            border: "none",
            borderRadius: 12,
            padding: "12px 16px",
            background: "#2563eb",
            color: "#ffffff",
            fontWeight: 900,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Upload your own CSV
        </button>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <UploadArea
            input={input}
            onInputChange={onInputChange}
            onFileUpload={onFileUpload}
          />

          <button
            type="button"
            onClick={onRun}
            disabled={!input.trim()}
            style={{
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
            Investigate my CSV
          </button>
        </div>
      )}
    </section>
  );
}

const blueEyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: 0.8,
  marginBottom: 8,
};