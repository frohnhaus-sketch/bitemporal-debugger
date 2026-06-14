"use client";

import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function AsKnownReportingPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "as_known_reporting",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "as-known-reporting",
      pageType: "learn_page",
    });
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 24% 8%, #2563eb 0, #1e3a8a 22%, #0f172a 54%, #020617 100%)",
        padding: "clamp(24px, 5vw, 48px) clamp(14px, 4vw, 24px)",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#e2e8f0",
      }}
    >
      <div style={{ maxWidth: 980, marginLeft: "auto", marginRight: "auto" }}>
        <header style={{ marginBottom: 40 }}>
          <a
            href="/patterns"
            style={{
              display: "inline-flex",
              color: "#bfdbfe",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: 14,
              marginBottom: 22,
            }}
          >
            ← Back to Pattern Catalog
          </a>

          <div>
            <div
              style={{
                display: "inline-flex",
                padding: "8px 12px",
                borderRadius: 999,
                background: "#dbeafe",
                color: "#075985",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              Reporting Pattern
            </div>
          </div>

          <h1
            style={{
              marginTop: 22,
              marginBottom: 16,
              fontSize: "clamp(34px, 8vw, 56px)",
              lineHeight: 1,
              color: "#ffffff",
              letterSpacing: "-0.05em",
            }}
          >
            As-Known Reporting
          </h1>

          <p
            style={{
              marginTop: 0,
              marginBottom: 0,
              maxWidth: 760,
              fontSize: 20,
              lineHeight: 1.6,
              color: "#dbeafe",
            }}
          >
            As-Known Reporting answers historical questions using only the
            information that was known at the reporting time.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard eyebrow="Problem" title="Past reports can be rewritten by future knowledge.">
            <p style={paragraphStyle}>
              A report can be historically correct in two different ways. It
              can show the corrected truth as we know it today, or it can show
              what was known when the report was originally produced.
            </p>

            <p style={paragraphStyle}>
              As-Known Reporting makes this distinction explicit. It protects
              published reports from being silently changed by later
              corrections.
            </p>

            <ChipRow
              chips={[
                "Future knowledge leakage",
                "Non-reproducible reports",
                "Audit disagreement",
                "Incorrect visible-time logic",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <WhiteCard eyebrow="Why it happens" title="Business time and knowledge time are different.">
            <p style={paragraphStyle}>
              The business effective date tells you when something was true in
              the real world. The visible or knowledge date tells you when the
              system actually knew about it.
            </p>

            <ChipRow
              chips={[
                "Late corrections",
                "Backdated changes",
                "Reloaded source history",
                "Bitemporal dimensions",
                "Corrected master data",
                "Published month-end reports",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Common modeling approaches"
            title="Make the reporting perspective explicit."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Track visible time"
                text="Store visible_from and visible_to so the model knows when a record became available."
              />
              <MiniCard
                title="Query with two dates"
                text="Use both the reporting date and the knowledge date when reconstructing reports."
              />
              <MiniCard
                title="Preserve knowledge states"
                text="Do not overwrite previous known states when corrections arrive later."
              />
              <MiniCard
                title="Separate report modes"
                text="Distinguish corrected-truth reporting from as-known reporting in the semantic layer."
              />
            </div>
          </WhiteCard>

          <WhiteCard eyebrow="Validation checks" title="Check that the past stays reproducible.">
            <CheckChipRow
              checks={[
                "Validate visible-time intervals",
                "Check whether future records leak into past reports",
                "Compare as-known output with published snapshots",
                "Detect retroactive corrections",
                "Validate bitemporal as-of queries",
              ]}
            />
          </WhiteCard>

          <WhiteCard eyebrow="Why it matters" title="As-known logic is often the reason bitemporal modeling exists.">
            <p style={paragraphStyle}>
              As-Known Reporting is essential when historical reports must be
              reproduced exactly as they were seen at the time.
            </p>

            <p style={paragraphStyle}>
              It prevents corrected history from silently rewriting the past and
              gives business users, auditors and engineers a shared definition
              of historical correctness.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="as_known_reporting" />

        <section
          style={{
            marginTop: 30,
            padding: 28,
            borderRadius: 24,
            background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
            border: "1px solid rgba(147, 197, 253, 0.8)",
            color: "#0f172a",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: "#2563eb",
              textTransform: "uppercase",
              letterSpacing: 0.7,
              marginBottom: 10,
            }}
          >
            Try it
          </div>

          <h2
            style={{
              marginTop: 0,
              marginBottom: 10,
              fontSize: 26,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "#0f172a",
            }}
          >
            Explore historical reporting behavior in the Workbench.
          </h2>

          <p
            style={{
              marginTop: 0,
              marginBottom: 20,
              fontSize: 16,
              lineHeight: 1.7,
              color: "#334155",
              maxWidth: 720,
            }}
          >
            Use the Historical Modeling Workbench to reason about historized
            sources, visible-time behavior and reproducible historical outputs.
          </p>

          <a
            href="/"
            onClick={() => {
              track("learn_cta_clicked", {
                page: "as_known_reporting",
                cta: "open_workbench",
              });
            }}
            style={{
              display: "inline-flex",
              padding: "12px 18px",
              borderRadius: 14,
              background: "#2563eb",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 900,
            }}
          >
            Open Historical Modeling Workbench →
          </a>
        </section>
      </div>
    </main>
  );
}

function DarkExampleCard() {
  return (
    <section
      style={{
        padding: 28,
        borderRadius: 24,
        background:
          "linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92))",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        boxShadow: "0 24px 70px rgba(2, 6, 23, 0.35)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          color: "#93c5fd",
          textTransform: "uppercase",
          letterSpacing: 0.7,
          marginBottom: 10,
        }}
      >
        Example
      </div>

      <h2
        style={{
          marginTop: 0,
          marginBottom: 16,
          fontSize: 28,
          lineHeight: 1.15,
          color: "#ffffff",
          letterSpacing: "-0.03em",
        }}
      >
        A January report should not use a March correction.
      </h2>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginTop: 20,
        }}
      >
        <TimelineItem
          label="January 31"
          title="Report is published"
          text="Customer segment is known as Retail."
        />
        <TimelineItem
          label="March 12"
          title="Correction arrives"
          text="The January segment is corrected to Premium."
        />
        <TimelineItem
          label="As-known view"
          title="January still shows Retail"
          text="Premium was not known when the January report was published."
        />
      </div>

      <p
        style={{
          marginTop: 18,
          marginBottom: 0,
          fontSize: 15,
          lineHeight: 1.7,
          color: "#cbd5e1",
        }}
      >
        The corrected-truth view may show Premium. The as-known January report
        should still show Retail.
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 14,
        padding: 14,
        borderRadius: 16,
        background: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(148, 163, 184, 0.24)",
      }}
    >
      <div
        style={{
          color: "#bfdbfe",
          fontSize: 13,
          fontWeight: 900,
        }}
      >
        {label}
      </div>

      <div>
        <div
          style={{
            color: "#ffffff",
            fontWeight: 900,
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#cbd5e1",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {text}
        </div>
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
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        padding: 28,
        borderRadius: 24,
        background: "rgba(255, 255, 255, 0.96)",
        border: "1px solid rgba(226, 232, 240, 0.9)",
        boxShadow: "0 24px 70px rgba(15, 23, 42, 0.18)",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          color: "#2563eb",
          textTransform: "uppercase",
          letterSpacing: 0.7,
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </div>

      <h2
        style={{
          marginTop: 0,
          marginBottom: 14,
          fontSize: 28,
          lineHeight: 1.15,
          color: "#0f172a",
          letterSpacing: "-0.03em",
        }}
      >
        {title}
      </h2>

      {children}
    </section>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 18,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontWeight: 900,
          color: "#0f172a",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "#475569",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function ChipRow({ chips }: { chips: string[] }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 18,
      }}
    >
      {chips.map((chip) => (
        <span
          key={chip}
          style={{
            display: "inline-flex",
            padding: "8px 11px",
            borderRadius: 999,
            background: "#eff6ff",
            color: "#1d4ed8",
            fontSize: 13,
            fontWeight: 900,
            border: "1px solid #bfdbfe",
          }}
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

function CheckChipRow({ checks }: { checks: string[] }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 8,
      }}
    >
      {checks.map((check) => (
        <span
          key={check}
          style={{
            display: "inline-flex",
            padding: "9px 12px",
            borderRadius: 999,
            background: "#ecfdf5",
            color: "#047857",
            fontSize: 13,
            fontWeight: 900,
            border: "1px solid #a7f3d0",
          }}
        >
          ✓ {check}
        </span>
      ))}
    </div>
  );
}

function RelatedPatterns({ current }: { current: string }) {
  const patterns = [
    {
      title: "Bitemporal Modeling",
      href: "/learn/bitemporal-modeling",
      key: "bitemporal_modeling",
    },
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
      title: "Snapshot Fact Modeling",
      href: "/learn/snapshot-fact-modeling",
      key: "snapshot_fact_modeling",
    },
    {
      title: "Historical Conformance",
      href: "/learn/historical-conformance",
      key: "historical_conformance",
    },
  ];

  return (
    <section
      style={{
        marginTop: 30,
        padding: 24,
        borderRadius: 22,
        background: "rgba(15, 23, 42, 0.72)",
        border: "1px solid rgba(148, 163, 184, 0.32)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          color: "#93c5fd",
          textTransform: "uppercase",
          letterSpacing: 0.7,
          marginBottom: 10,
        }}
      >
        Related Patterns
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
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
              style={{
                display: "inline-flex",
                padding: "9px 12px",
                borderRadius: 999,
                background: "#ffffff",
                color: "#1d4ed8",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 900,
              }}
            >
              {pattern.title}
            </a>
          ))}
      </div>
    </section>
  );
}

const paragraphStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  fontSize: 16,
  lineHeight: 1.8,
  color: "#334155",
};

const solutionGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 14,
  marginTop: 18,
};