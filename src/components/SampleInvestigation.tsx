"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "@/lib/analytics";

export const SAMPLE_INVESTIGATION_INPUT = `contract_id,customer_id,snapshot_date,status,premium_amount,customer_segment,valid_from,valid_to,snapshot_method,coverage_status
C-1001,U-10,2024-01-31,active,120.00,Bronze,2024-01-01,2024-02-01,current_rebuild_only,ok
C-1001,U-10,2024-02-29,active,120.00,Bronze,2024-02-01,2024-03-01,current_rebuild_only,ok
C-1001,U-10,2024-04-30,active,135.00,Gold,2024-04-01,2024-05-01,current_rebuild_only,ok
C-1002,U-20,2024-01-31,active,90.00,Silver,2024-01-01,2024-02-01,current_rebuild_only,ok
C-1002,U-20,2024-01-31,active,90.00,Silver,2024-01-01,2024-02-01,current_rebuild_only,ok
C-1002,U-20,2024-02-29,cancelled,90.00,Silver,2024-02-01,2024-03-01,current_rebuild_only,ok`;

type SceneId =
  | "alert"
  | "mismatch"
  | "checks"
  | "history"
  | "timeline"
  | "root-cause"
  | "impact";

const SCENES: {
  id: SceneId;
  label: string;
  title: string;
  description: string;
}[] = [
  {
    id: "alert",
    label: "Alert",
    title: "Revenue changed overnight",
    description: "Finance sees a mismatch although no new orders arrived.",
  },
  {
    id: "mismatch",
    label: "Mismatch",
    title: "Two reports disagree",
    description: "The business number changed, but the source total did not.",
  },
  {
    id: "checks",
    label: "Checks",
    title: "Classic checks pass",
    description: "Schema, rows, nulls and joins look technically fine.",
  },
  {
    id: "history",
    label: "Records",
    title: "The record has history",
    description: "The customer has two valid historical versions.",
  },
  {
    id: "timeline",
    label: "Timeline",
    title: "The order belongs to the old state",
    description: "The order happened before the customer became Premium.",
  },
  {
    id: "root-cause",
    label: "Root cause",
    title: "The join ignored time",
    description: "The query matched the customer, but not the valid version.",
  },
  {
    id: "impact",
    label: "Impact",
    title: "Now verify the table",
    description: "Run the analyzer on the generated sample target table.",
  },
];

export function SampleInvestigation({
  startSignal = 0,
  onRunInvestigation,
}: {
  startSignal?: number;
  onRunInvestigation: (input: string) => void;
}) {
  const [started, setStarted] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const scene = SCENES[sceneIndex];
  const isLast = sceneIndex === SCENES.length - 1;

  const progress = useMemo(
    () => Math.round(((sceneIndex + 1) / SCENES.length) * 100),
    [sceneIndex],
  );

  function start() {
    setStarted(true);
    setSceneIndex(0);
    setAnimationKey((key) => key + 1);

    track("guided_investigation_started", {
      scenario: "revenue_mismatch",
    });

    window.setTimeout(() => {
      document
        .getElementById("guided-sample-investigation")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function goToScene(index: number) {
    setSceneIndex(index);
    setAnimationKey((key) => key + 1);
  }

  function next() {
    if (!started) return;
    if (isLast) return;

    goToScene(sceneIndex + 1);
  }

  function runAnalyzer() {
    track("guided_investigation_completed", {
      scenario: "revenue_mismatch",
    });

    onRunInvestigation(SAMPLE_INVESTIGATION_INPUT);
  }

  function back() {
    if (sceneIndex === 0) return;
    goToScene(sceneIndex - 1);
  }

  useEffect(() => {
    if (startSignal > 0) start();
  }, [startSignal]);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 820);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!started) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "ArrowRight" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        next();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        back();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [started, sceneIndex, isLast]);

  if (!started) {
    return (
      <section id="guided-sample-investigation" style={introStyle}>
        <div style={eyebrowStyle}>Guided investigation</div>
        <h3 style={introTitleStyle}>
          Revenue increased overnight. No new orders arrived.
        </h3>
        <p style={introTextStyle}>
          Walk through one historical data incident. Click anywhere, press
          Space, Enter or → to advance.
        </p>
        <button type="button" onClick={start} style={primaryButtonStyle}>
          Start guided investigation →
        </button>
      </section>
    );
  }

  return (
    <section
      id="guided-sample-investigation"
      onClick={next}
      style={{
        marginTop: 16,
        borderRadius: 16,
        overflow: "hidden",
        color: "#ffffff",
        background:
          "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.18), transparent 34%), #020617",
        border: "1px solid rgba(255,255,255,0.10)",
        cursor: isLast ? "default" : "pointer",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "132px minmax(0, 1fr)",
        }}
      >
        <TimelineNav
          sceneIndex={sceneIndex}
          onSelect={goToScene}
          isMobile={isMobile}
        />

        <main style={{ padding: isMobile ? 12 : 16 }}>
          <div style={headerRowStyle}>
            <div>
              <div style={eyebrowStyle}>Investigation scene</div>
              <h3 style={sceneTitleStyle}>{scene.title}</h3>
            </div>
            <div style={countStyle}>
              {sceneIndex + 1} / {SCENES.length}
            </div>
          </div>

          <div style={progressOuterStyle}>
            <div style={{ ...progressInnerStyle, width: `${progress}%` }} />
          </div>

          <AnimatedScene key={animationKey} sceneId={scene.id} />

          <div style={footerControlsStyle}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                back();
              }}
              disabled={sceneIndex === 0}
              style={{
                ...secondaryButtonStyle,
                opacity: sceneIndex === 0 ? 0.35 : 1,
              }}
            >
              ← Back
            </button>

            <div style={hintStyle}>
              {isLast
                ? "Ready to inspect the sample table."
                : isMobile
                  ? "Tap anywhere to continue"
                  : "Click anywhere · Space · Enter · →"}
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                if (isLast) {
                  runAnalyzer();
                  return;
                }

                next();
              }}
              style={primaryButtonStyle}
            >
              {isLast ? "Run analyzer on this table" : "Next →"}
            </button>
          </div>
        </main>
      </div>
    </section>
  );
}

function TimelineNav({
  sceneIndex,
  onSelect,
  isMobile,
}: {
  sceneIndex: number;
  onSelect: (index: number) => void;
  isMobile: boolean;
}) {
  if (isMobile) {
    return (
      <nav style={mobileNavStyle}>
        {SCENES.map((scene, index) => (
          <button
            key={scene.id}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelect(index);
            }}
            style={mobilePillStyle(index === sceneIndex, index < sceneIndex)}
          >
            {index + 1}. {scene.label}
          </button>
        ))}
      </nav>
    );
  }

  return (
    <aside style={sideNavStyle} onClick={(event) => event.stopPropagation()}>
      <div style={eyebrowStyle}>Story</div>

      <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
        {SCENES.map((scene, index) => {
          const active = index === sceneIndex;
          const done = index < sceneIndex;

          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => onSelect(index)}
              style={compactNavItemStyle(active)}
            >
              <span style={navNumberStyle(active, done)}>{index + 1}</span>
              <span style={navLabelStyle(active, done)}>{scene.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function AnimatedScene({ sceneId }: { sceneId: SceneId }) {
  return (
    <div style={animatedSceneStyle}>
      <style>
        {`
          @keyframes fadeScene {
            from {
              opacity: 0;
              transform: translateY(12px) scale(0.985);
              filter: blur(5px);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
          }

          @keyframes slowGlow {
            0%, 100% { box-shadow: 0 0 0 rgba(96,165,250,0); }
            50% { box-shadow: 0 0 42px rgba(96,165,250,0.25); }
          }

          @keyframes scanLine {
            from { transform: translateX(-120%); }
            to { transform: translateX(120%); }
          }
        `}
      </style>

      {sceneId === "alert" && <AlertScene />}
      {sceneId === "mismatch" && <MismatchScene />}
      {sceneId === "checks" && <ChecksScene />}
      {sceneId === "history" && <HistoryScene />}
      {sceneId === "timeline" && <TimelineScene />}
      {sceneId === "root-cause" && <RootCauseScene />}
      {sceneId === "impact" && <ImpactScene />}
    </div>
  );
}

function AlertScene() {
  return (
    <div style={centerSceneStyle}>
      <div style={alertCardStyle}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.50)" }}>
          #finance-alerts · 08:14
        </div>
        <div style={{ marginTop: 8, fontSize: 20, lineHeight: 1.35 }}>
          Revenue increased by{" "}
          <strong style={{ color: "#fb7185" }}>€150k</strong> overnight.
        </div>
        <div style={mutedTextStyle}>
          No new orders arrived. The pipeline is green.
        </div>
      </div>
    </div>
  );
}

function MismatchScene() {
  return (
    <div style={sceneGrid3Style}>
      <MetricCard label="Finance report" value="€1.20M" tone="bad" />
      <MetricCard label="Orders total" value="€1.05M" tone="good" />
      <MetricCard label="Mismatch" value="+€150k" tone="warn" />
    </div>
  );
}

function ChecksScene() {
  const checks = [
    "Columns detected",
    "Dates parse",
    "No NULL keys",
    "Row count unchanged",
    "Pipeline green",
  ];

  return (
    <div style={{ display: "grid", gap: 9 }}>
      {checks.map((check, index) => (
        <div
          key={check}
          style={{
            ...checkLineStyle,
            animation: `fadeScene 650ms ease ${index * 180}ms both`,
          }}
        >
          <span style={checkIconStyle}>✓</span>
          <span>{check}</span>
          <span style={{ marginLeft: "auto", color: "#86efac" }}>OK</span>
        </div>
      ))}

      <InsightBox tone="good">
        Classic data quality checks pass. The issue is historical correctness.
      </InsightBox>
    </div>
  );
}

function HistoryScene() {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={tableGridStyle}>
        <MiniTable
          title="customers_history"
          columns={["customer_id", "segment", "valid_from", "valid_to"]}
          rows={[
            ["C001", "Standard", "2023-01-01", "2023-12-31"],
            ["C001", "Premium", "2024-01-01", "9999-12-31"],
          ]}
          highlightRow={1}
        />

        <MiniTable
          title="orders"
          columns={["order_id", "customer_id", "order_date", "amount"]}
          rows={[
            ["O-1001", "C001", "2023-06-01", "500k"],
            ["O-1002", "C001", "2024-02-01", "550k"],
          ]}
          highlightRow={0}
        />
      </div>

      <InsightBox tone="warn">
        The order is valid. The customer is valid. But which customer version
        was valid at order time?
      </InsightBox>
    </div>
  );
}

function TimelineScene() {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={timelineGridStyle}>
        <div style={timelineLabelStyle}>Customer</div>
        <div style={standardBarStyle}>Standard · 2023</div>
        <div style={premiumBarStyle}>Premium · 2024</div>

        <div style={timelineLabelStyle}>Order</div>
        <div style={eventBarStyle}>● O-1001 · 2023-06-01</div>
        <div style={wrongMatchStyle}>✕ joined to Premium</div>
      </div>

      <InsightBox tone="warn">
        The order happened in 2023. The report used the 2024 customer state.
      </InsightBox>
    </div>
  );
}

function RootCauseScene() {
  return (
    <div style={rootGridStyle}>
      <div style={{ display: "grid", gap: 8 }}>
        <DebugLine>✓ customer_id predicate found</DebugLine>
        <DebugLine>Scanning for temporal predicate...</DebugLine>
        <DebugLine danger>✕ temporal predicate not found</DebugLine>

        <InsightBox tone="bad">
          Root cause: the join matched the customer, but not the historically
          valid version.
        </InsightBox>
      </div>

      <pre style={codeStyle}>{`-- incorrect
JOIN customers_history c
  ON o.customer_id = c.customer_id

-- missing
AND o.order_date >= c.valid_from
AND o.order_date <  c.valid_to`}</pre>
    </div>
  );
}

function ImpactScene() {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={sceneGrid3Style}>
        <MetricCard label="Revenue overstated" value="14%" tone="bad" />
        <MetricCard label="Impact" value="€150k" tone="warn" />
        <MetricCard label="Fix" value="Temporal join" tone="good" />
      </div>

      <MiniTable
        title="sample_target_table"
        columns={[
          "contract_id",
          "snapshot_date",
          "premium",
          "valid_from",
          "valid_to",
          "method",
        ]}
        rows={[
          [
            "C-1001",
            "2024-01-31",
            "120",
            "2024-01-01",
            "2024-02-01",
            "current_rebuild_only",
          ],
          [
            "C-1001",
            "2024-02-29",
            "120",
            "2024-02-01",
            "2024-03-01",
            "current_rebuild_only",
          ],
          [
            "C-1001",
            "2024-04-30",
            "135",
            "2024-04-01",
            "2024-05-01",
            "current_rebuild_only",
          ],
          [
            "C-1002",
            "2024-01-31",
            "90",
            "2024-01-01",
            "2024-02-01",
            "current_rebuild_only",
          ],
          [
            "C-1002",
            "2024-01-31",
            "90",
            "2024-01-01",
            "2024-02-01",
            "current_rebuild_only",
          ],
        ]}
        highlightRow={4}
      />

      <InsightBox tone="good">
        This is the table the analyzer will inspect next.
      </InsightBox>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "bad" | "warn";
}) {
  const color =
    tone === "bad"
      ? "#fb7185"
      : tone === "warn"
        ? "#fbbf24"
        : tone === "good"
          ? "#34d399"
          : "#ffffff";

  return (
    <div style={metricStyle}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
        {label}
      </div>
      <div style={{ marginTop: 5, fontSize: 22, fontWeight: 900, color }}>
        {value}
      </div>
    </div>
  );
}

function MiniTable({
  title,
  columns,
  rows,
  highlightRow,
}: {
  title: string;
  columns: string[];
  rows: string[][];
  highlightRow?: number;
}) {
  return (
    <div style={miniTableOuterStyle}>
      <div style={miniTableTitleStyle}>{title}</div>
      <div style={{ overflowX: "auto" }}>
        <table style={miniTableStyle}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} style={thStyle}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  background:
                    rowIndex === highlightRow
                      ? "rgba(251,191,36,0.18)"
                      : "transparent",
                }}
              >
                {row.map((value, columnIndex) => (
                  <td key={columnIndex} style={tdStyle}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InsightBox({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "good" | "warn" | "bad";
}) {
  const styles = {
    good: {
      background: "rgba(34,197,94,0.10)",
      border: "1px solid rgba(34,197,94,0.22)",
      color: "#bbf7d0",
    },
    warn: {
      background: "rgba(251,191,36,0.10)",
      border: "1px solid rgba(251,191,36,0.24)",
      color: "#fde68a",
    },
    bad: {
      background: "rgba(127,29,29,0.20)",
      border: "1px solid rgba(251,113,133,0.35)",
      color: "#fecaca",
    },
  }[tone];

  return <div style={{ ...insightStyle, ...styles }}>{children}</div>;
}

function DebugLine({
  children,
  danger = false,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div style={{ ...debugLineStyle, color: danger ? "#fb7185" : "#cbd5e1" }}>
      {!danger && <span style={scanStyle} />}
      <span style={{ position: "relative" }}>{children}</span>
    </div>
  );
}

const introStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 20,
  borderRadius: 16,
  background:
    "radial-gradient(circle at 18% 0%, rgba(124,58,237,0.22), transparent 38%), #020617",
  border: "1px solid rgba(147,197,253,0.24)",
  color: "#ffffff",
};

const introTitleStyle: React.CSSProperties = {
  margin: "7px 0 0",
  maxWidth: 760,
  fontSize: 28,
  lineHeight: 1.08,
  letterSpacing: "-0.045em",
};

const introTextStyle: React.CSSProperties = {
  margin: "9px 0 14px",
  maxWidth: 720,
  color: "rgba(255,255,255,0.68)",
  fontSize: 14,
  lineHeight: 1.45,
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#93c5fd",
  fontWeight: 900,
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  marginBottom: 10,
};

const sceneTitleStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 23,
  lineHeight: 1.1,
  letterSpacing: "-0.035em",
};

const countStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(255,255,255,0.58)",
  whiteSpace: "nowrap",
};

const progressOuterStyle: React.CSSProperties = {
  height: 6,
  borderRadius: 999,
  background: "rgba(255,255,255,0.10)",
  overflow: "hidden",
  marginBottom: 12,
};

const progressInnerStyle: React.CSSProperties = {
  height: "100%",
  borderRadius: 999,
  background: "linear-gradient(90deg,#60a5fa,#a78bfa)",
  transition: "width 320ms ease",
};

const animatedSceneStyle: React.CSSProperties = {
  minHeight: 220,
  padding: 12,
  borderRadius: 13,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.10)",
  animation: "fadeScene 760ms cubic-bezier(.2,.8,.2,1) both",
};

const footerControlsStyle: React.CSSProperties = {
  marginTop: 10,
  paddingTop: 8,
  borderTop: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "center",
};

const hintStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.55)",
  fontSize: 12,
  textAlign: "center",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 13px",
  borderRadius: 11,
  border: "none",
  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
  color: "#ffffff",
  fontWeight: 900,
  cursor: "pointer",
  fontSize: 13,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "9px 12px",
  borderRadius: 11,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#ffffff",
  fontWeight: 900,
  cursor: "pointer",
  fontSize: 13,
};

const sideNavStyle: React.CSSProperties = {
  padding: 12,
  background: "rgba(2,6,23,0.55)",
  borderRight: "1px solid rgba(255,255,255,0.08)",
};

const navItemStyle = (active: boolean): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "22px 1fr",
  gap: 9,
  textAlign: "left",
  background: active ? "rgba(124,58,237,0.18)" : "transparent",
  border: active ? "1px solid rgba(196,181,253,0.28)" : "1px solid transparent",
  borderRadius: 10,
  padding: 7,
  color: "#ffffff",
  cursor: "pointer",
});

const compactNavItemStyle = (active: boolean): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "20px 1fr",
  gap: 8,
  alignItems: "center",
  textAlign: "left",
  background: active ? "rgba(124,58,237,0.18)" : "transparent",
  border: active ? "1px solid rgba(196,181,253,0.28)" : "1px solid transparent",
  borderRadius: 9,
  padding: "6px 7px",
  color: "#ffffff",
  cursor: "pointer",
});

const navNumberStyle = (
  active: boolean,
  done: boolean,
): React.CSSProperties => ({
  width: 20,
  height: 20,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  fontSize: 10,
  fontWeight: 900,
  background: active
    ? "rgba(124,58,237,0.9)"
    : done
      ? "rgba(45,212,191,0.5)"
      : "rgba(255,255,255,0.10)",
});

const navLabelStyle = (
  active: boolean,
  done: boolean,
): React.CSSProperties => ({
  display: "block",
  fontSize: 12,
  fontWeight: 900,
  color: active ? "#c4b5fd" : done ? "#5eead4" : "#ffffff",
});

const navDescriptionStyle: React.CSSProperties = {
  display: "block",
  marginTop: 2,
  fontSize: 10.5,
  lineHeight: 1.28,
  color: "rgba(255,255,255,0.48)",
};

const mobileNavStyle: React.CSSProperties = {
  padding: 10,
  display: "flex",
  gap: 8,
  overflowX: "auto",
  background: "rgba(2,6,23,0.55)",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const mobilePillStyle = (
  active: boolean,
  done: boolean,
): React.CSSProperties => ({
  flex: "0 0 auto",
  padding: "7px 9px",
  borderRadius: 999,
  border: active
    ? "1px solid rgba(196,181,253,0.75)"
    : "1px solid rgba(255,255,255,0.10)",
  background: active
    ? "rgba(124,58,237,0.35)"
    : done
      ? "rgba(45,212,191,0.16)"
      : "rgba(255,255,255,0.045)",
  color: active ? "#ffffff" : "rgba(255,255,255,0.72)",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
});

const centerSceneStyle: React.CSSProperties = {
  minHeight: 240,
  display: "grid",
  placeItems: "center",
};

const alertCardStyle: React.CSSProperties = {
  maxWidth: 620,
  padding: 18,
  borderRadius: 16,
  background: "rgba(15,23,42,0.84)",
  border: "1px solid rgba(148,163,184,0.22)",
  animation: "slowGlow 2600ms ease infinite",
};

const mutedTextStyle: React.CSSProperties = {
  marginTop: 7,
  color: "rgba(255,255,255,0.68)",
  fontSize: 14,
  lineHeight: 1.45,
};

const sceneGrid3Style: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
};

const metricStyle: React.CSSProperties = {
  minHeight: 62,
  padding: 11,
  borderRadius: 12,
  background: "rgba(15,23,42,0.62)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const checkLineStyle: React.CSSProperties = {
  display: "flex",
  gap: 9,
  alignItems: "center",
  padding: "8px 10px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: 13,
};

const checkIconStyle: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 7,
  display: "grid",
  placeItems: "center",
  background: "rgba(34,197,94,0.14)",
  color: "#86efac",
};

const tableGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 10,
};

const rootGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 10,
};

const miniTableOuterStyle: React.CSSProperties = {
  borderRadius: 13,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(2,6,23,0.45)",
  minWidth: 0,
};

const miniTableTitleStyle: React.CSSProperties = {
  padding: "8px 10px",
  background: "rgba(255,255,255,0.06)",
  fontSize: 12,
  color: "rgba(255,255,255,0.75)",
};

const miniTableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 11.5,
  minWidth: 520,
};

const insightStyle: React.CSSProperties = {
  marginTop: 2,
  padding: 11,
  borderRadius: 11,
  fontSize: 12.5,
  lineHeight: 1.45,
  fontWeight: 700,
};

const timelineGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "100px minmax(0, 1fr) minmax(0, 1fr)",
  gap: 8,
  alignItems: "center",
};

const timelineLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(255,255,255,0.55)",
};

const standardBarStyle: React.CSSProperties = {
  padding: "9px 10px",
  borderRadius: 999,
  background: "rgba(251,191,36,0.18)",
  border: "1px solid rgba(251,191,36,0.25)",
  fontSize: 12,
};

const premiumBarStyle: React.CSSProperties = {
  padding: "9px 10px",
  borderRadius: 999,
  background: "rgba(59,130,246,0.18)",
  border: "1px solid rgba(59,130,246,0.25)",
  fontSize: 12,
};

const eventBarStyle: React.CSSProperties = {
  color: "#fbbf24",
  padding: "8px 10px",
  fontSize: 12,
};

const wrongMatchStyle: React.CSSProperties = {
  color: "#fb7185",
  padding: "8px 10px",
  fontSize: 12,
};

const codeStyle: React.CSSProperties = {
  margin: 0,
  padding: 13,
  borderRadius: 13,
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#93c5fd",
  fontSize: 11.5,
  lineHeight: 1.45,
  overflow: "auto",
};

const debugLineStyle: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  padding: "9px 11px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: 12.5,
};

const scanStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(90deg, transparent, rgba(96,165,250,0.10), transparent)",
  animation: "scanLine 1400ms ease both",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "6px 7px",
  color: "rgba(255,255,255,0.48)",
  fontWeight: 500,
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const tdStyle: React.CSSProperties = {
  padding: "6px 7px",
  color: "rgba(255,255,255,0.84)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};
