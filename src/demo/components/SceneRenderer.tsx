"use client";

import { useDemoStore } from "@/state/demoStore";
import { revenueMismatchScenario } from "../scenarios/revenueMismatchScenario";

export function SceneRenderer() {
  const { currentIndex, focus } = useDemoStore();
  const scene = revenueMismatchScenario[currentIndex];

  if (!scene) return null;

  return (
    <div
      style={{
        padding: 24,
        borderRadius: 16,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        opacity: focus === "scene" ? 1 : 0.35,
        transform: focus === "scene" ? "scale(1)" : "scale(0.98)",
        transition: "all 400ms ease",
      }}
    >
      <div style={eyebrowStyle}>{scene.eyebrow}</div>

      <h2 style={{ fontSize: 28, margin: "12px 0" }}>{scene.title}</h2>

      <p style={{ fontSize: 17, opacity: 0.75, lineHeight: 1.5 }}>
        {scene.narrative}
      </p>

      <div style={{ marginTop: 24 }}>
        {scene.focus === "report" && <ReportView />}
        {scene.focus === "tables" && <TablesView />}
        {scene.focus === "join" && <JoinView />}
        {scene.focus === "timeline" && <TemporalTimelineView />}
        {scene.focus === "impact" && <ImpactView />}
      </div>

      {scene.primaryInsight && (
        <div style={insightStyle}>{scene.primaryInsight}</div>
      )}
    </div>
  );
}

function ReportView() {
  return (
    <div style={grid3Style}>
      <MetricCard label="Reported revenue" value="EUR 1.20M" tone="bad" />
      <MetricCard label="Expected from orders" value="EUR 1.05M" />
      <MetricCard label="Mismatch" value="+ EUR 150k" tone="warn" />
    </div>
  );
}

function TablesView() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <MiniTable
        title="customers_history"
        columns={["customer_id", "segment", "valid_from", "valid_to"]}
        rows={[
          ["C1", "Standard", "2023-01-01", "2023-12-31"],
          ["C1", "Premium", "2024-01-01", "9999-12-31"],
        ]}
      />
      <MiniTable
        title="orders"
        columns={["order_id", "customer_id", "order_date", "amount"]}
        rows={[
          ["O1", "C1", "2023-06-01", "500k"],
          ["O2", "C1", "2024-02-01", "550k"],
        ]}
      />

      <div style={{ gridColumn: "1 / -1", ...checksStyle }}>
        ✔ Columns detected &nbsp;&nbsp; ✔ Customer IDs match &nbsp;&nbsp; ✔ No
        NULLs &nbsp;&nbsp; ✔ Date ranges look valid &nbsp;&nbsp; ✔ Pipeline
        green
      </div>
    </div>
  );
}

function JoinView() {
  return (
    <div style={joinBoxStyle}>
      <div style={joinNodeStyle}>
        <div style={smallLabelStyle}>Order</div>
        <strong>O1 · 2023-06-01</strong>
        <div style={{ opacity: 0.6 }}>EUR 500k</div>
      </div>

      <div style={{ fontSize: 28, opacity: 0.6 }}>→</div>

      <div style={{ ...joinNodeStyle, borderColor: "rgba(239,68,68,0.6)" }}>
        <div style={smallLabelStyle}>Matched customer state</div>
        <strong>Premium</strong>
        <div style={{ color: "#fecaca" }}>valid from 2024 ❌</div>
      </div>

      <div style={{ gridColumn: "1 / -1", color: "#fecaca", lineHeight: 1.5 }}>
        The join used <code>customer_id</code>, but ignored{" "}
        <code>order_date BETWEEN valid_from AND valid_to</code>.
      </div>
    </div>
  );
}

function TemporalTimelineView() {
  return (
    <div style={timelineBoxStyle}>
      <div style={timelineRowStyle}>
        <div style={timelineLabelStyle}>Customer state</div>
        <div style={barStyle}>Standard · 2023</div>
        <div style={{ ...barStyle, background: "rgba(239,68,68,0.18)" }}>
          Premium · 2024
        </div>
      </div>

      <div style={timelineRowStyle}>
        <div style={timelineLabelStyle}>Order event</div>
        <div style={eventStyle}>● O1</div>
        <div style={{ ...eventStyle, color: "#fecaca" }}>
          wrong match → Premium
        </div>
      </div>

      <div style={{ marginTop: 18, color: "#bfdbfe" }}>
        Correct match: O1 belongs to Standard, because the order happened in
        2023.
      </div>
    </div>
  );
}

function ImpactView() {
  return (
    <div style={grid3Style}>
      <MetricCard label="Revenue overstatement" value="+14.3%" tone="bad" />
      <MetricCard label="Financial impact" value="EUR 150k" tone="warn" />
      <MetricCard label="Root cause" value="Temporal join" />
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "bad" | "warn";
}) {
  const color =
    tone === "bad" ? "#fecaca" : tone === "warn" ? "#fde68a" : "#fff";

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 14,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.55 }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  );
}

function MiniTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          background: "rgba(255,255,255,0.08)",
          fontSize: 13,
          opacity: 0.8,
        }}
      >
        {title}
      </div>

      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} style={cellHeaderStyle}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => (
                <td key={j} style={cellStyle}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const eyebrowStyle = {
  fontSize: 12,
  opacity: 0.5,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const insightStyle = {
  marginTop: 18,
  padding: 16,
  borderRadius: 12,
  background: "rgba(96,165,250,0.12)",
  border: "1px solid rgba(96,165,250,0.25)",
  color: "#bfdbfe",
  fontSize: 16,
  lineHeight: 1.5,
};

const grid3Style = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 16,
};

const checksStyle = {
  padding: 14,
  borderRadius: 12,
  background: "rgba(34,197,94,0.10)",
  border: "1px solid rgba(34,197,94,0.25)",
  color: "#bbf7d0",
  fontSize: 14,
};

const cellHeaderStyle = {
  textAlign: "left" as const,
  padding: "8px 10px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.55)",
  fontWeight: 500,
};

const cellStyle = {
  padding: "8px 10px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.85)",
};

const joinBoxStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  gap: 18,
  alignItems: "center",
  padding: 18,
  borderRadius: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const joinNodeStyle = {
  padding: 18,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.05)",
};

const smallLabelStyle = {
  fontSize: 12,
  opacity: 0.55,
  marginBottom: 8,
};

const timelineBoxStyle = {
  padding: 18,
  borderRadius: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const timelineRowStyle = {
  display: "grid",
  gridTemplateColumns: "140px 1fr 1fr",
  gap: 12,
  alignItems: "center",
  marginTop: 12,
};

const timelineLabelStyle = {
  fontSize: 13,
  opacity: 0.55,
};

const barStyle = {
  padding: "12px 14px",
  borderRadius: 999,
  background: "rgba(96,165,250,0.18)",
  border: "1px solid rgba(96,165,250,0.25)",
};

const eventStyle = {
  padding: "10px 14px",
  color: "#fff",
};
