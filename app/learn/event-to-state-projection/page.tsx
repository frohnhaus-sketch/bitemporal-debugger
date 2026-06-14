"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

export default function EventToStateProjectionPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "event_to_state_projection",
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
            page: "event-to-state-projection",
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
            <div style={badgeStyle}>Advanced Modeling Pattern</div>
          </div>

          <h1 style={h1Style}>Event-to-State Projection</h1>

          <p style={heroTextStyle}>
            Event-to-State Projection derives valid state intervals from ordered
            business events.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="Source systems store events, but reporting often needs state."
          >
            <p style={paragraphStyle}>
              Many systems store changes as events. A contract is activated,
              suspended, reactivated and cancelled as a sequence of business
              events.
            </p>

            <p style={paragraphStyle}>
              For reporting, users usually need to know the state of the
              contract at each reporting date. Event-to-State Projection converts
              event sequences into valid-time intervals.
            </p>

            <ChipRow
              chips={[
                "Incorrect ordering",
                "Missing transitions",
                "Invalid state sequences",
                "Wrong interval boundaries",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <WhiteCard
            eyebrow="Why it happens"
            title="Events describe changes, while reports ask for conditions over time."
          >
            <p style={paragraphStyle}>
              An event tells you that something changed at a point in time. A
              state table tells you what was true during an interval. Projection
              bridges those two representations.
            </p>

            <ChipRow
              chips={[
                "Event-sourced history",
                "Status transitions",
                "CDC journals",
                "Workflow systems",
                "Snapshot reporting",
                "Interval joins",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Common modeling approaches"
            title="Turn ordered events into stable valid-time intervals."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Order events"
                text="Sort events by entity, event time and a deterministic tie-breaker."
              />
              <MiniCard
                title="Map events to states"
                text="Define which resulting state each event type creates."
              />
              <MiniCard
                title="Close with next event"
                text="Use the next event time as the valid_to boundary of the current state."
              />
              <MiniCard
                title="Validate transitions"
                text="Check that the projected sequence follows allowed business state changes."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate the projection before using it for snapshots."
          >
            <CheckChipRow
              checks={[
                "Validate event ordering per entity",
                "Detect duplicate transition events",
                "Check missing terminal or initial events",
                "Validate state coverage after projection",
                "Compare projected state against known snapshots",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it matters"
            title="Projection creates a stable bridge between event history and interval reporting."
          >
            <p style={paragraphStyle}>
              Event-to-State Projection is essential when source systems provide
              history as events but analytics require interval-based state.
            </p>

            <p style={paragraphStyle}>
              Without projection, reporting logic often repeatedly reinterprets
              raw events in inconsistent ways.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="event_to_state_projection" />

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
        A contract event stream becomes valid state intervals.
      </h2>

      <div style={projectionGridStyle}>
        <div>
          <div style={exampleSubheadStyle}>Contract events</div>

          <div style={eventListStyle}>
            <EventRow date="Jan 05" text="Created" />
            <EventRow date="Feb 01" text="Activated" />
            <EventRow date="Jun 10" text="Suspended" />
            <EventRow date="Jul 03" text="Reactivated" />
            <EventRow date="Nov 20" text="Cancelled" />
          </div>
        </div>

        <div>
          <div style={exampleSubheadStyle}>Projected state intervals</div>

          <div style={stateListStyle}>
            <StateRow state="Draft" range="Jan 05 – Jan 31" />
            <StateRow state="Active" range="Feb 01 – Jun 09" />
            <StateRow state="Suspended" range="Jun 10 – Jul 02" />
            <StateRow state="Active" range="Jul 03 – Nov 19" />
            <StateRow state="Cancelled" range="Nov 20 onward" />
          </div>
        </div>
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Projection rule</div>

        <p style={exampleNoteTextStyle}>
          Each event creates the next state. The following event closes the
          previous state interval.
        </p>
      </div>
    </section>
  );
}

function EventRow({ date, text }: { date: string; text: string }) {
  return (
    <div style={compactRowStyle}>
      <span style={compactDateStyle}>{date}</span>
      <span style={compactTextStyle}>{text}</span>
    </div>
  );
}

function StateRow({ state, range }: { state: string; range: string }) {
  return (
    <div style={stateRowStyle}>
      <span style={stateNameStyle}>{state}</span>
      <span style={stateRangeStyle}>{range}</span>
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
        Explore event-to-state behavior in the Workbench.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to reason about event streams,
        projected state intervals, snapshot joins and historical validation
        checks.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "event_to_state_projection",
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
      title: "Event Modeling",
      href: "/learn/event-modeling",
      key: "event_modeling",
    },
    {
      title: "State Modeling",
      href: "/learn/state-modeling",
      key: "state_modeling",
    },
    {
      title: "State Reduction",
      href: "/learn/state-reduction",
      key: "state_reduction",
    },
    {
      title: "Historical Backfill",
      href: "/learn/historical-backfill",
      key: "historical_backfill",
    },
    {
      title: "Snapshot Reproducibility",
      href: "/learn/snapshot-reproducibility",
      key: "snapshot_reproducibility",
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
  boxSizing: "border-box",
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
  marginBottom: 16,
  fontSize: "clamp(24px, 6vw, 28px)",
  lineHeight: 1.15,
  color: "#ffffff",
  letterSpacing: "-0.03em",
};

const projectionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 18,
  marginTop: 22,
};

const exampleSubheadStyle: CSSProperties = {
  color: "#bfdbfe",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 10,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const eventListStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const stateListStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const compactRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
  padding: 12,
  borderRadius: 14,
  background: "rgba(255, 255, 255, 0.06)",
  border: "1px solid rgba(148, 163, 184, 0.24)",
};

const compactDateStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 13,
  fontWeight: 900,
};

const compactTextStyle: CSSProperties = {
  color: "#e2e8f0",
  fontSize: 14,
  fontWeight: 800,
};

const stateRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
  padding: 12,
  borderRadius: 14,
  background: "rgba(219, 234, 254, 0.12)",
  border: "1px solid rgba(147, 197, 253, 0.45)",
};

const stateNameStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 900,
};

const stateRangeStyle: CSSProperties = {
  color: "#bfdbfe",
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