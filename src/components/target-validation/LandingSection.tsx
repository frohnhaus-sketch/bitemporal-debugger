"use client";

import type React from "react";
import { SampleInvestigation } from "@/components/SampleInvestigation";

type SampleScenarioId =
  | "revenue_rebuild"
  | "customer_missing"
  | "duplicate_snapshot";

type SampleScenario = {
  id: SampleScenarioId;
  title: string;
  icon: string;
  description: string;
  rows: Record<string, string>[];
  csv: string;
};

export function LandingSection({
  Hero,
  ScenarioPicker,
  ChoiceCard,
  sampleScenario,
  selectedScenario,
  sampleStartToken,
  onScenarioSelected,
  onRunGuidedInvestigation,
  onOwnTable,
}: {
  Hero: React.ComponentType;
  ScenarioPicker: React.ComponentType<{
    selectedScenario: SampleScenarioId;
    onSelect: (scenarioId: SampleScenarioId) => void;
  }>;
  ChoiceCard: React.ComponentType<{
    eyebrow: string;
    title: string;
    description: string;
    buttonLabel: string;
    active: boolean;
    primary?: boolean;
    badge?: string;
    onClick: () => void;
  }>;
  sampleScenario: SampleScenario;
  selectedScenario: SampleScenarioId;
  sampleStartToken: number;
  onScenarioSelected: (scenarioId: SampleScenarioId) => void;
  onRunGuidedInvestigation: () => void;
  onOwnTable: () => void;
}) {
  return (
    <>
      <Hero />

      <div style={{ marginTop: 18 }}>
        <SampleInvestigation
          scenario={sampleScenario}
          startSignal={sampleStartToken}
          onRunInvestigation={onRunGuidedInvestigation}
        />
      </div>

      <div style={landingGridStyle}>
        <div style={{ minWidth: 0 }}>
          <div style={blueEyebrowStyle}>
            Or choose another sample investigation
          </div>

          <div style={{ maxWidth: 620, minWidth: 0 }}>
            <ScenarioPicker
              selectedScenario={selectedScenario}
              onSelect={onScenarioSelected}
            />
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={blueEyebrowStyle}>Or use your own data</div>

          <ChoiceCard
            eyebrow=""
            title="Analyze your own table"
            description="Paste or upload a CSV output from a notebook, dbt model or pipeline. Analysis runs in your browser; nothing is stored."
            buttonLabel="Upload your own CSV"
            active={false}
            primary
            badge="Recommended after the sample"
            onClick={onOwnTable}
          />
        </div>
      </div>
    </>
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

const landingGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
  columnGap: 28,
  rowGap: 18,
  marginTop: 22,
  alignItems: "start",
  minWidth: 0,
};
