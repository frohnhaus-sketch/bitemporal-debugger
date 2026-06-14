"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { useEffect, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

export default function BitemporalModelingPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "bitemporal_modeling",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "learn/bitemporal-modeling",
      pageType: "learn_page",
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
            page: "bitemporal-modeling",
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
            <div style={badgeStyle}>Foundation Pattern</div>
          </div>

          <h1 style={h1Style}>Bitemporal Modeling</h1>

          <p style={heroTextStyle}>
            Bitemporal Modeling separates when something was valid in the
            business from when it was known by the system.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="Corrected history can silently rewrite the past."
          >
            <p style={paragraphStyle}>
              Traditional historized models usually track when a record was
              valid in the business. But historical reporting often also needs
              to know when that record became visible to the reporting system.
            </p>

            <p style={paragraphStyle}>
              Without this second timeline, corrected or late-arriving history
              can change past reports even though those reports could not have
              known the corrected information at the time.
            </p>

            <ChipRow
              chips={[
                "Future knowledge leakage",
                "Late-arriving history",
                "Non-reproducible reports",
                "Audit ambiguity",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <WhiteCard
            eyebrow="Why it happens"
            title="A business fact has two different time meanings."
          >
            <p style={paragraphStyle}>
              Valid time describes when the record is true in the business.
              Visible time describes when the system knew about that record.
              These two timelines often diverge when sources correct, reload or
              restate historical data.
            </p>

            <ChipRow
              chips={[
                "Backdated corrections",
                "Source reloads",
                "Delayed ingestion",
                "Retrospective fixes",
                "Corrected dimensions",
                "Snapshot rebuilding",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Common modeling approaches"
            title="Store both the business timeline and the knowledge timeline."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Valid-time interval"
                text="Use valid_from and valid_to to represent when a record is true in the business."
              />
              <MiniCard
                title="Visible-time interval"
                text="Use visible_from and visible_to to represent when the system knew that version."
              />
              <MiniCard
                title="Bitemporal as-of queries"
                text="Query with both a reporting date and a knowledge date."
              />
              <MiniCard
                title="Preserve old knowledge"
                text="Keep previous visible states instead of overwriting them with corrected history."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate that both timelines behave correctly."
          >
            <CheckChipRow
              checks={[
                "Validate visible-time continuity",
                "Detect retroactive corrections",
                "Compare current truth with as-known results",
                "Validate snapshot reproducibility",
                "Check whether future knowledge leaks into past reports",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it matters"
            title="Bitemporal Modeling explains what was true and what was known."
          >
            <p style={paragraphStyle}>
              Bitemporal Modeling is the foundation for historical reporting
              that must distinguish corrected truth from as-known truth.
            </p>

            <p style={paragraphStyle}>
              It is especially important when source systems can correct past
              records, deliver history late or restate historical facts.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="bitemporal_modeling" />

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
        A January business fact may only become known in March.
      </h2>

      <div style={timelineBoxStyle}>
        <TimelineItem
          label="Business-valid time"
          title="Valid from January 1"
          text="The customer segment is true for the business from the start of January."
        />
        <TimelineItem
          label="System-visible time"
          title="Visible from March 10"
          text="The correction only arrives in the reporting system in March."
        />
        <TimelineItem
          label="Reporting impact"
          title="January rebuilt today knows more"
          text="A rebuilt January report may include knowledge that the original January report did not have."
        />
      </div>

      <div style={codeBoxStyle}>
        <code style={codeStyle}>
          {`valid_from   / valid_to     → when the record is true in the business
visible_from / visible_to   → when the record is known by the system`}
        </code>
      </div>

      <p style={darkParagraphStyle}>
        Bitemporal Modeling keeps both perspectives available instead of forcing
        one historical interpretation into the data model.
      </p>
    </section>
  );
}

function TimelineItem({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text: string;
}) {
  return (
    <div style={timelineItemStyle}>
      <div style={timelineLabelStyle}>{label}</div>

      <div>
        <div style={timelineTitleStyle}>{title}</div>
        <div style={timelineTextStyle}>{text}</div>
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
        Explore bitemporal behavior in the Workbench.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to reason about valid-time,
        visible-time, corrections and reproducible historical outputs.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "bitemporal_modeling",
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
      title: "Historical Correction",
      href: "/learn/historical-correction",
      key: "historical_correction",
    },
    {
      title: "Snapshot Reproducibility",
      href: "/learn/snapshot-reproducibility",
      key: "snapshot_reproducibility",
    },
    {
      title: "Historical Conformance",
      href: "/learn/historical-conformance",
      key: "historical_conformance",
    },
    {
      title: "Dimension Completion",
      href: "/learn/dimension-completion",
      key: "dimension_completion",
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

const timelineBoxStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 20,
};

const timelineItemStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  padding: 14,
  borderRadius: 16,
  background: "rgba(255, 255, 255, 0.06)",
  border: "1px solid rgba(148, 163, 184, 0.24)",
};

const timelineLabelStyle: CSSProperties = {
  color: "#bfdbfe",
  fontSize: 13,
  fontWeight: 900,
};

const timelineTitleStyle: CSSProperties = {
  color: "#ffffff",
  fontWeight: 900,
  marginBottom: 4,
};

const timelineTextStyle: CSSProperties = {
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