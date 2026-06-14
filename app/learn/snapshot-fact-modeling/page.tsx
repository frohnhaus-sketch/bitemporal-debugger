"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

export default function SnapshotFactModelingPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "snapshot_fact_modeling",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    const trackedDepths = new Set<number>();

    function handleScroll() {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) return;

      const percent = Math.round((window.scrollY / docHeight) * 100);

      [25, 50, 75, 100].forEach((threshold) => {
        if (percent >= threshold && !trackedDepths.has(threshold)) {
          trackedDepths.add(threshold);

          track("scroll_depth", {
            page: "snapshot-fact-modeling",
            page_type: "interactive_example",
            percent: threshold,
          });
        }
      });
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main style={mainStyle}>
      <div style={pageStyle}>
        <header style={{ marginBottom: 40 }}>
          <a href="/patterns" style={backLinkStyle}>
            ← Back to Pattern Catalog
          </a>

          <div>
            <div style={badgeStyle}>Reporting Pattern</div>
          </div>

          <h1 style={h1Style}>Snapshot Fact Modeling</h1>

          <p style={heroTextStyle}>
            Snapshot Fact Modeling creates reproducible fact rows for fixed
            reporting dates such as month-end, quarter-end or daily snapshots.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="Business reporting often needs stable facts for fixed reporting dates."
          >
            <p style={paragraphStyle}>
              Operational systems usually store events, current state or
              historized records, but reporting often asks for a stable view at
              a fixed reporting date.
            </p>

            <p style={paragraphStyle}>
              Business users ask questions like: how many active contracts did
              we have at month-end, what was the portfolio value on December 31,
              or which customers belonged to each segment at quarter-end?
            </p>

            <ChipRow
              chips={[
                "Missing snapshot dates",
                "Duplicate snapshot rows",
                "Unstable month-end reporting",
                "Current-state leakage",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <WhiteCard
            eyebrow="Why it happens"
            title="Source history and reporting calendars are not the same thing."
          >
            <p style={paragraphStyle}>
              Sources change whenever business events happen. Reporting usually
              happens on fixed dates. Snapshot Fact Modeling bridges that gap by
              resolving source history into one fact row per entity and snapshot
              date.
            </p>

            <ChipRow
              chips={[
                "Month-end reporting",
                "Portfolio snapshots",
                "As-of entity state",
                "Historical dimensions",
                "Late-arriving data",
                "Frozen vs rebuilt reports",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Common modeling approaches"
            title="Make the reporting date explicit in the fact table."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Define snapshot dates"
                text="Create an explicit calendar of required reporting dates such as month-end or quarter-end."
              />
              <MiniCard
                title="Resolve entity state"
                text="Determine the state of each entity as of every required snapshot date."
              />
              <MiniCard
                title="Join historically"
                text="Join dimensions using point-in-time or bitemporal as-of logic instead of current values."
              />
              <MiniCard
                title="Persist facts"
                text="Store one fact row per entity and snapshot date to stabilize recurring reporting."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate uniqueness, coverage and reproducibility."
          >
            <CheckChipRow
              checks={[
                "Validate one row per entity per snapshot date",
                "Detect missing snapshot coverage",
                "Compare snapshot totals against source or published reports",
                "Check dimension coverage for every snapshot fact row",
                "Validate reproducibility after source corrections",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it matters"
            title="Snapshot facts turn complex historical behavior into simple, repeatable reporting."
          >
            <p style={paragraphStyle}>
              Snapshot facts are often the bridge between complex historical
              source behavior and simple business reporting.
            </p>

            <p style={paragraphStyle}>
              They make recurring reporting dates explicit, reduce repeated
              as-of logic and create a stable basis for KPIs.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="snapshot_fact_modeling" />

        <TryItCard />
      </div>
    </main>
  );
}

function DarkExampleCard() {
  return (
    <section style={darkCardStyle}>
      <div style={darkEyebrowStyle}>Example</div>

      <h2 style={darkTitleStyle}>
        Contract C1 is resolved into one fact row per month-end snapshot.
      </h2>

      <div style={snapshotGridStyle}>
        <SnapshotCard date="2026-01-31" status="Active" premium="100" />
        <SnapshotCard date="2026-02-28" status="Active" premium="100" />
        <SnapshotCard date="2026-03-31" status="Cancelled" premium="0" />
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Snapshot fact grain</div>

        <p style={exampleNoteTextStyle}>
          One row per entity and snapshot date. The fact table stores the
          reporting state at the reporting date, making month-end reporting
          stable and repeatable.
        </p>
      </div>
    </section>
  );
}

function SnapshotCard({
  date,
  status,
  premium,
}: {
  date: string;
  status: string;
  premium: string;
}) {
  return (
    <div style={snapshotCardStyle}>
      <div style={snapshotDateStyle}>{date}</div>
      <div style={snapshotStatusStyle}>{status}</div>
      <div style={snapshotMetricStyle}>Premium = {premium}</div>
    </div>
  );
}

function WhiteCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section style={whiteCardStyle}>
      <div style={eyebrowStyle}>{eyebrow}</div>
      <h2 style={cardTitleStyle}>{title}</h2>
      {children}
    </section>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div style={miniCardStyle}>
      <div style={miniCardTitleStyle}>{title}</div>
      <div style={miniCardTextStyle}>{text}</div>
    </div>
  );
}

function ChipRow({ chips }: { chips: string[] }) {
  return (
    <div style={chipRowStyle}>
      {chips.map((chip) => (
        <span key={chip} style={riskChipStyle}>
          {chip}
        </span>
      ))}
    </div>
  );
}

function CheckChipRow({ checks }: { checks: string[] }) {
  return (
    <div style={checkRowStyle}>
      {checks.map((check) => (
        <span key={check} style={checkChipStyle}>
          ✓ {check}
        </span>
      ))}
    </div>
  );
}

function TryItCard() {
  return (
    <section style={tryItCardStyle}>
      <div style={tryItEyebrowStyle}>Try it</div>

      <h2 style={tryItTitleStyle}>
        Explore snapshot modeling risks in the Workbench.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to reason about snapshot dates,
        historical joins, dimension coverage and reproducible reporting.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "snapshot_fact_modeling",
            cta: "open_workbench",
          });
        }}
        style={tryItButtonStyle}
      >
        Open Historical Modeling Workbench →
      </a>
    </section>
  );
}

function RelatedPatterns({ current }: { current: string }) {
  const patterns = [
    {
      title: "Snapshot Reproducibility",
      href: "/learn/snapshot-reproducibility",
      key: "snapshot_reproducibility",
    },
    {
      title: "Event-to-State Projection",
      href: "/learn/event-to-state-projection",
      key: "event_to_state_projection",
    },
    {
      title: "Dimension Completion",
      href: "/learn/dimension-completion",
      key: "dimension_completion",
    },
    {
      title: "Bitemporal Modeling",
      href: "/learn/bitemporal-modeling",
      key: "bitemporal_modeling",
    },
    {
      title: "Historical Backfill",
      href: "/learn/historical-backfill",
      key: "historical_backfill",
    },
  ];

  return (
    <section style={relatedSectionStyle}>
      <div style={relatedTitleStyle}>Related Patterns</div>

      <div style={relatedGridStyle}>
        {patterns
          .filter((pattern) => pattern.key !== current)
          .map((pattern) => (
            <a
              key={pattern.key}
              href={pattern.href}
              onClick={() => {
                track("related_pattern_clicked", {
                  from: current,
                  to: pattern.key,
                });
              }}
              style={relatedLinkStyle}
            >
              {pattern.title}
            </a>
          ))}
      </div>
    </section>
  );
}

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  maxWidth: "100vw",
  overflowX: "hidden",
  background:
    "radial-gradient(circle at 24% 8%, #2563eb 0, #1e3a8a 22%, #0f172a 54%, #020617 100%)",
  padding: "clamp(24px, 5vw, 48px) clamp(14px, 4vw, 24px)",
  fontFamily: "Inter, Arial, sans-serif",
  color: "#e2e8f0",
  boxSizing: "border-box",
};

const pageStyle: CSSProperties = {
  width: "100%",
  maxWidth: 980,
  marginLeft: "auto",
  marginRight: "auto",
  minWidth: 0,
};

const backLinkStyle: CSSProperties = {
  display: "inline-flex",
  color: "#bfdbfe",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 14,
  marginBottom: 22,
};

const badgeStyle: CSSProperties = {
  display: "inline-flex",
  padding: "8px 12px",
  borderRadius: 999,
  background: "#dbeafe",
  color: "#075985",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.6,
  textTransform: "uppercase",
};

const h1Style: CSSProperties = {
  marginTop: 22,
  marginBottom: 16,
  fontSize: "clamp(34px, 8vw, 56px)",
  lineHeight: 1,
  color: "#ffffff",
  letterSpacing: "-0.05em",
};

const heroTextStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 0,
  maxWidth: 760,
  fontSize: 20,
  lineHeight: 1.6,
  color: "#dbeafe",
};

const whiteCardStyle: CSSProperties = {
  padding: "clamp(20px, 5vw, 28px)",
  borderRadius: 24,
  background: "rgba(255, 255, 255, 0.96)",
  border: "1px solid rgba(226, 232, 240, 0.9)",
  boxShadow: "0 24px 70px rgba(15, 23, 42, 0.18)",
  color: "#0f172a",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
};

const eyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const cardTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: "clamp(24px, 6vw, 28px)",
  lineHeight: 1.15,
  color: "#0f172a",
  letterSpacing: "-0.03em",
};

const paragraphStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  fontSize: 16,
  lineHeight: 1.8,
  color: "#334155",
  overflowWrap: "break-word",
};

const chipRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 18,
};

const riskChipStyle: CSSProperties = {
  display: "inline-flex",
  padding: "8px 11px",
  borderRadius: 999,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: 13,
  fontWeight: 900,
  border: "1px solid #bfdbfe",
};

const darkCardStyle: CSSProperties = {
  padding: "clamp(20px, 5vw, 28px)",
  borderRadius: 24,
  background:
    "linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92))",
  border: "1px solid rgba(148, 163, 184, 0.35)",
  boxShadow: "0 24px 70px rgba(2, 6, 23, 0.35)",
};

const darkEyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#93c5fd",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const darkTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 18,
  fontSize: "clamp(24px, 6vw, 28px)",
  lineHeight: 1.15,
  color: "#ffffff",
  letterSpacing: "-0.03em",
};

const snapshotGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12,
  marginTop: 18,
};

const snapshotCardStyle: CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(219, 234, 254, 0.12)",
  border: "1px solid rgba(147, 197, 253, 0.38)",
};

const snapshotDateStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 10,
};

const snapshotStatusStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 20,
  fontWeight: 900,
  marginBottom: 6,
};

const snapshotMetricStyle: CSSProperties = {
  color: "#cbd5e1",
  fontSize: 14,
  fontWeight: 800,
};

const exampleNoteStyle: CSSProperties = {
  marginTop: 18,
  padding: 18,
  borderRadius: 16,
  background: "#020617",
  border: "1px solid #334155",
};

const exampleNoteLabelStyle: CSSProperties = {
  color: "#93c5fd",
  fontWeight: 900,
  fontSize: 13,
};

const exampleNoteTextStyle: CSSProperties = {
  marginTop: 8,
  marginBottom: 0,
  color: "#cbd5e1",
  fontSize: 15,
  lineHeight: 1.55,
};

const solutionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 14,
  marginTop: 18,
};

const miniCardStyle: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const miniCardTitleStyle: CSSProperties = {
  fontWeight: 900,
  color: "#0f172a",
  marginBottom: 8,
};

const miniCardTextStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#475569",
};

const checkRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 8,
};

const checkChipStyle: CSSProperties = {
  display: "inline-flex",
  padding: "9px 12px",
  borderRadius: 999,
  background: "#ecfdf5",
  color: "#047857",
  fontSize: 13,
  fontWeight: 900,
  border: "1px solid #a7f3d0",
};

const relatedSectionStyle: CSSProperties = {
  marginTop: 30,
  padding: 24,
  borderRadius: 22,
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.32)",
};

const relatedTitleStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#93c5fd",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const relatedGridStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const relatedLinkStyle: CSSProperties = {
  display: "inline-flex",
  padding: "9px 12px",
  borderRadius: 999,
  background: "#ffffff",
  color: "#1d4ed8",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 900,
};

const tryItCardStyle: CSSProperties = {
  marginTop: 30,
  padding: 28,
  borderRadius: 24,
  background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
  border: "1px solid rgba(147, 197, 253, 0.8)",
  color: "#0f172a",
};

const tryItEyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const tryItTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 10,
  fontSize: 26,
  lineHeight: 1.15,
  letterSpacing: "-0.03em",
  color: "#0f172a",
};

const tryItTextStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 20,
  fontSize: 16,
  lineHeight: 1.7,
  color: "#334155",
  maxWidth: 720,
};

const tryItButtonStyle: CSSProperties = {
  display: "inline-flex",
  padding: "12px 18px",
  borderRadius: 14,
  background: "#2563eb",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 900,
};