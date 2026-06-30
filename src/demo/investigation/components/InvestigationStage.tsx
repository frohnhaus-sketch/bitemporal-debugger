import { customersHistory, orders } from "../InvestigationData";
import { investigationSteps } from "../InvestigationScenario";
import { MetricCard } from "./MetricCard";
import { MiniTable } from "./MiniTable";
import { ProgressiveReveal } from "./ProgressiveReveal";

export function InvestigationStage({ currentStep }: { currentStep: number }) {
  const step = investigationSteps[currentStep];

  return (
    <main style={{ flex: 1, padding: 32 }}>
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#c4b5fd",
          marginBottom: 24,
        }}
      >
        Investigation: Revenue Mismatch
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        {currentStep >= 0 && (
          <ProgressiveReveal revealKey="alert" delay={0}>
            <AlertBlock />
          </ProgressiveReveal>
        )}

        {currentStep >= 1 && (
          <ProgressiveReveal revealKey="mismatch" delay={80}>
            <MismatchBlock />
          </ProgressiveReveal>
        )}

        {currentStep >= 2 && (
          <ProgressiveReveal revealKey="checks" delay={120}>
            <ChecksBlock />
          </ProgressiveReveal>
        )}

        {currentStep >= 3 && (
          <ProgressiveReveal revealKey="join-checks" delay={120}>
            <JoinChecksBlock />
          </ProgressiveReveal>
        )}

        {currentStep >= 4 && (
          <ProgressiveReveal revealKey="records" delay={120}>
            <RecordsBlock />
          </ProgressiveReveal>
        )}

        {currentStep >= 5 && (
          <ProgressiveReveal revealKey="timeline" delay={120}>
            <TimelineBlock />
          </ProgressiveReveal>
        )}

        {currentStep >= 6 && (
          <ProgressiveReveal revealKey="root-cause" delay={120}>
            <RootCauseBlock />
          </ProgressiveReveal>
        )}

        {currentStep >= 7 && (
          <ProgressiveReveal revealKey="impact" delay={120}>
            <ImpactBlock />
          </ProgressiveReveal>
        )}
      </div>
    </main>
  );
}

function AlertBlock() {
  return (
    <section style={panelStyle}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ fontSize: 28 }}>💬</div>
        <div>
          <div style={{ fontSize: 13, opacity: 0.55 }}>
            #finance-alerts · 08:14
          </div>
          <div style={{ marginTop: 8, fontSize: 18, lineHeight: 1.55 }}>
            Revenue increased by{" "}
            <strong style={{ color: "#fb7185" }}>150k</strong> overnight. No new
            orders arrived. Can someone investigate?
          </div>
        </div>
      </div>
    </section>
  );
}

function MismatchBlock() {
  return (
    <section
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}
    >
      <MetricCard
        label="Finance report"
        value="1.20M"
        hint="Revenue"
        tone="bad"
      />
      <MetricCard
        label="Orders report"
        value="1.05M"
        hint="Revenue"
        tone="good"
      />
      <MetricCard
        label="Difference"
        value="+150k"
        hint="Something does not add up."
        tone="warn"
      />
    </section>
  );
}

function ChecksBlock() {
  const checks = [
    "Columns",
    "Dates",
    "Missing values",
    "Row counts",
    "Pipeline",
  ];

  return (
    <section style={panelStyle}>
      <div
        style={{
          fontSize: 13,
          color: "#93c5fd",
          marginBottom: 16,
          letterSpacing: "0.04em",
        }}
      >
        Running initial checks...
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {checks.map((label, index) => (
          <ProgressiveReveal
            key={label}
            revealKey={`check-${label}`}
            delay={400 + index * 350}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(34,197,94,0.14)",
                  color: "#86efac",
                }}
              >
                ✓
              </div>

              <div>
                <div style={{ fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 12, color: "#86efac" }}>OK</div>
              </div>
            </div>
          </ProgressiveReveal>
        ))}
      </div>

      <ProgressiveReveal revealKey="checks-summary" delay={2400}>
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            background: "rgba(34,197,94,0.10)",
            color: "#bbf7d0",
            border: "1px solid rgba(34,197,94,0.22)",
          }}
        >
          No obvious data quality issue found. Digging deeper.
        </div>
      </ProgressiveReveal>
    </section>
  );
}

function JoinChecksBlock() {
  const checks = [
    "Checking customer_id matches",
    "Checking duplicate joins",
    "Checking missing customers",
    "Checking order totals",
  ];

  return (
    <section style={panelStyle}>
      <div
        style={{
          fontSize: 13,
          color: "#93c5fd",
          marginBottom: 16,
          letterSpacing: "0.04em",
        }}
      >
        Inspecting joins...
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {checks.map((label, index) => (
          <ProgressiveReveal
            key={label}
            revealKey={`join-check-${index}`}
            delay={350 + index * 360}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(34,197,94,0.14)",
                  color: "#86efac",
                }}
              >
                ✓
              </div>

              <div>
                <div style={{ fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 12, color: "#86efac" }}>OK</div>
              </div>
            </div>
          </ProgressiveReveal>
        ))}
      </div>

      <ProgressiveReveal revealKey="join-check-summary" delay={2100}>
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            background: "rgba(251,191,36,0.10)",
            color: "#fde68a",
            border: "1px solid rgba(251,191,36,0.24)",
          }}
        >
          Still no classic join problem. Checking historical versions next.
        </div>
      </ProgressiveReveal>
    </section>
  );
}

function RecordsBlock() {
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={panelStyle}>
        <ProgressiveReveal revealKey="records-title" delay={200}>
          <div style={{ color: "#93c5fd", fontSize: 13 }}>
            Zooming into suspicious customer C001...
          </div>
        </ProgressiveReveal>

        <ProgressiveReveal revealKey="records-found" delay={700}>
          <div style={{ marginTop: 14, fontSize: 26, fontWeight: 800 }}>
            2 historical customer versions found
          </div>
        </ProgressiveReveal>

        <ProgressiveReveal revealKey="records-warning" delay={1300}>
          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 12,
              background: "rgba(251,191,36,0.10)",
              border: "1px solid rgba(251,191,36,0.25)",
              color: "#fde68a",
            }}
          >
            The order is valid. The customer is valid. The question is: which
            customer version was valid at order time?
          </div>
        </ProgressiveReveal>
      </div>

      <ProgressiveReveal revealKey="records-tables" delay={1800}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <MiniTable
            title="customers_history"
            columns={["customer_id", "segment", "valid_from", "valid_to"]}
            rows={customersHistory}
            highlightRow={1}
          />
          <MiniTable
            title="orders"
            columns={["order_id", "customer_id", "order_date", "amount"]}
            rows={orders}
            highlightRow={0}
          />
        </div>
      </ProgressiveReveal>
    </section>
  );
}

function TimelineBlock() {
  return (
    <section style={panelStyle}>
      <ProgressiveReveal revealKey="timeline-title" delay={100}>
        <div style={{ color: "#93c5fd", fontSize: 13, marginBottom: 18 }}>
          Replaying customer history...
        </div>
      </ProgressiveReveal>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "140px 1fr 1fr",
          gap: 12,
        }}
      >
        <div style={timelineLabel}>Customer state</div>

        <ProgressiveReveal revealKey="timeline-standard" delay={500}>
          <div style={standardBar}>Standard · 2023</div>
        </ProgressiveReveal>

        <ProgressiveReveal revealKey="timeline-premium" delay={900}>
          <div style={premiumBar}>Premium · 2024</div>
        </ProgressiveReveal>

        <div style={timelineLabel}>Order event</div>

        <ProgressiveReveal revealKey="timeline-order" delay={1400}>
          <div style={{ color: "#fbbf24", padding: "10px 14px" }}>
            ● O-1001 · 2023-06-01
          </div>
        </ProgressiveReveal>

        <ProgressiveReveal revealKey="timeline-wrong-match" delay={2000}>
          <div style={{ color: "#fb7185", padding: "10px 14px" }}>
            ✕ joined to Premium
          </div>
        </ProgressiveReveal>
      </div>

      <ProgressiveReveal revealKey="timeline-summary" delay={2600}>
        <div style={{ marginTop: 18, color: "#fde68a", lineHeight: 1.5 }}>
          The order happened in 2023, when the customer was still Standard.
        </div>
      </ProgressiveReveal>
    </section>
  );
}

function RootCauseBlock() {
  return (
    <section
      style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}
    >
      <div style={panelStyle}>
        <ProgressiveReveal revealKey="root-inspect" delay={100}>
          <div style={{ color: "#93c5fd", fontSize: 13 }}>
            Inspecting join predicate...
          </div>
        </ProgressiveReveal>

        <ProgressiveReveal revealKey="root-customer-id" delay={600}>
          <div style={debugLineStyle}>✓ customer_id predicate found</div>
        </ProgressiveReveal>

        <ProgressiveReveal revealKey="root-date-search" delay={1200}>
          <div style={debugLineStyle}>Searching temporal predicate...</div>
        </ProgressiveReveal>

        <ProgressiveReveal revealKey="root-date-missing" delay={1900}>
          <div style={{ ...debugLineStyle, color: "#fb7185" }}>
            ✕ temporal predicate not found
          </div>
        </ProgressiveReveal>

        <ProgressiveReveal revealKey="root-final" delay={2400}>
          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 14,
              background: "rgba(127,29,29,0.18)",
              border: "1px solid rgba(251,113,133,0.35)",
            }}
          >
            <div style={{ color: "#fb7185", fontSize: 18, fontWeight: 800 }}>
              Root cause found
            </div>
            <div style={{ marginTop: 10, lineHeight: 1.55, opacity: 0.82 }}>
              The join matched the customer, but not the historically valid
              customer version.
            </div>
          </div>
        </ProgressiveReveal>
      </div>

      <ProgressiveReveal revealKey="root-sql" delay={2800}>
        <pre
          style={{
            ...panelStyle,
            margin: 0,
            fontSize: 12,
            color: "#93c5fd",
            overflow: "auto",
          }}
        >{`-- incorrect
JOIN customers_history c
  ON o.customer_id = c.customer_id

-- missing
AND o.order_date >= c.valid_from
AND o.order_date <  c.valid_to`}</pre>
      </ProgressiveReveal>
    </section>
  );
}

function ImpactBlock() {
  return (
    <section
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}
    >
      <MetricCard
        label="Revenue overstated"
        value="14%"
        hint="vs orders"
        tone="bad"
      />
      <MetricCard label="Impact" value="150k" hint="Overstated" tone="warn" />
      <MetricCard
        label="Recommended fix"
        value="Temporal join"
        hint="Use validity range"
        tone="good"
      />
    </section>
  );
}

const panelStyle = {
  padding: 22,
  borderRadius: 18,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const timelineLabel = {
  fontSize: 13,
  opacity: 0.55,
  paddingTop: 12,
};

const standardBar = {
  padding: "12px 14px",
  borderRadius: 999,
  background: "rgba(251,191,36,0.18)",
  border: "1px solid rgba(251,191,36,0.25)",
};

const premiumBar = {
  padding: "12px 14px",
  borderRadius: 999,
  background: "rgba(59,130,246,0.18)",
  border: "1px solid rgba(59,130,246,0.25)",
};

const debugLineStyle = {
  marginTop: 14,
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#cbd5e1",
  fontSize: 14,
};
