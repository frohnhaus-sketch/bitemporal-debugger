"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

export default function EventModelingPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "event_modeling",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  return (
    <main style={mainStyle}>
      <div style={pageStyle}>
        <header style={{ marginBottom: 40 }}>
          <a href="/patterns" style={backLinkStyle}>
            ← Back to Pattern Catalog
          </a>

          <div>
            <div style={badgeStyle}>Foundation Pattern</div>
          </div>

          <h1 style={h1Style}>Event Modeling</h1>

          <p style={heroTextStyle}>
            Event Modeling represents discrete business events that happened at
            a specific point in time.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24, minWidth: 0 }}>
          <WhiteCard
            eyebrow="Problem"
            title="Not every historical fact is a state."
          >
            <p style={paragraphStyle}>
              Many business processes are better represented as events: a claim
              is filed, a payment is received, a contract is changed or a
              customer status is updated.
            </p>

            <p style={paragraphStyle}>
              Event Modeling captures what happened, when it happened and which
              entity it affected.
            </p>

            <ChipRow
              chips={[
                "Duplicate events",
                "Incorrect ordering",
                "Missing timestamps",
                "State/event confusion",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <WhiteCard
            eyebrow="Why it happens"
            title="Business changes often happen as point-in-time actions."
          >
            <p style={paragraphStyle}>
              Events describe transitions, decisions or transactions. They are
              not valid over an interval by themselves, but they can be used to
              derive state, snapshots or audit history.
            </p>

            <ChipRow
              chips={[
                "CDC streams",
                "Audit journals",
                "Transactions",
                "Status changes",
                "Contract mutations",
                "Business process logs",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Common modeling approaches"
            title="Store one row per business event."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Use event time"
                text="Store event_time or effective_at as the business timestamp of the event."
              />
              <MiniCard
                title="Keep ingestion separate"
                text="Do not confuse when the event happened with when it arrived in your platform."
              />
              <MiniCard
                title="Preserve ordering"
                text="Define deterministic ordering within each entity, especially for same-day or same-second events."
              />
              <MiniCard
                title="Derive state carefully"
                text="Only derive states or snapshots after validating that the event stream is complete enough."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate the event stream before deriving history."
          >
            <CheckChipRow
              checks={[
                "Detect duplicate events",
                "Validate event ordering per entity",
                "Check required event types",
                "Detect missing or impossible timestamps",
                "Validate event-to-state alignment",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it matters"
            title="Events explain how business history changed."
          >
            <p style={paragraphStyle}>
              Event Modeling is the foundation for understanding how business
              changes happened.
            </p>

            <p style={paragraphStyle}>
              Many reporting models eventually need both state and events:
              state to answer what was true, and events to explain what changed.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="event_modeling" />

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
        A contract history can be represented as a sequence of events.
      </h2>

      <div style={eventListStyle}>
        <EventRow
          date="Jan 05"
          title="Contract created"
          text="A new contract is opened for the customer."
        />
        <EventRow
          date="Apr 10"
          title="Premium changed"
          text="The premium is updated after a business change."
        />
        <EventRow
          date="Sep 20"
          title="Contract cancelled"
          text="The contract lifecycle ends with a cancellation event."
        />
      </div>

      <div style={codeBoxStyle}>
        <code style={codeStyle}>
          {`entity_id | event_type        | event_time
C-1001    | CONTRACT_CREATED  | 2024-01-05
C-1001    | PREMIUM_CHANGED   | 2024-04-10
C-1001    | CONTRACT_CANCELLED| 2024-09-20`}
        </code>
      </div>

      <p style={darkParagraphStyle}>
        The event stream can later be used to derive state, snapshots or audit
        history — but only if the events are complete, ordered and correctly
        interpreted.
      </p>
    </section>
  );
}

function EventRow({
  date,
  title,
  text,
}: {
  date: string;
  title: string;
  text: string;
}) {
  return (
    <div style={eventRowStyle}>
      <div style={eventDateStyle}>{date}</div>

      <div>
        <div style={eventTitleStyle}>{title}</div>
        <div style={eventTextStyle}>{text}</div>
      </div>
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
        derived states, historical joins and reporting behavior.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "event_modeling",
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
      title: "State Modeling",
      href: "/learn/state-modeling",
      key: "state_modeling",
    },
    {
      title: "State ↔ Event Alignment",
      href: "/learn/state-event-alignment",
      key: "state_event_alignment",
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
  overflowX: "hidden",
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
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  overflow: "hidden",
  padding: "clamp(20px, 5vw, 28px)",
  borderRadius: 24,
  background: "rgba(255, 255, 255, 0.96)",
  border: "1px solid rgba(226, 232, 240, 0.9)",
  boxShadow: "0 24px 70px rgba(15, 23, 42, 0.18)",
  color: "#0f172a",
  boxSizing: "border-box",
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
  fontSize: "clamp(15px, 4vw, 16px)",
  lineHeight: 1.8,
  color: "#334155",
  overflowWrap: "anywhere",
  wordBreak: "normal",
};

const chipRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 18,
  maxWidth: "100%",
  overflow: "hidden",
};

const riskChipStyle: CSSProperties = {
  display: "inline-flex",
  maxWidth: "100%",
  padding: "8px 11px",
  borderRadius: 999,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: 13,
  fontWeight: 900,
  border: "1px solid #bfdbfe",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
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

const eventListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 20,
};

const eventRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  padding: 14,
  borderRadius: 16,
  background: "rgba(255, 255, 255, 0.06)",
  border: "1px solid rgba(148, 163, 184, 0.24)",
};

const eventDateStyle: CSSProperties = {
  color: "#bfdbfe",
  fontSize: 13,
  fontWeight: 900,
};

const eventTitleStyle: CSSProperties = {
  color: "#ffffff",
  fontWeight: 900,
  marginBottom: 4,
};

const eventTextStyle: CSSProperties = {
  color: "#cbd5e1",
  fontSize: 14,
  lineHeight: 1.6,
};

const codeBoxStyle: CSSProperties = {
  marginTop: 16,
  padding: 16,
  borderRadius: 16,
  background: "#020617",
  border: "1px solid #334155",
  overflowX: "auto",
};

const codeStyle: CSSProperties = {
  whiteSpace: "pre",
  color: "#bfdbfe",
  fontSize: 13,
  lineHeight: 1.7,
};

const darkParagraphStyle: CSSProperties = {
  marginTop: 18,
  marginBottom: 0,
  fontSize: 15,
  lineHeight: 1.7,
  color: "#cbd5e1",
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