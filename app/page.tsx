"use client";
import { useEffect, useRef, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { AdvisorPanel } from "@/components/AdvisorPanel";
import { ModelReviewPanel } from "@/components/ModelReviewPanel";
import { TargetTableValidationPanel } from "@/components/TargetTableValidationPanel";
import { TwoSourceValidationWorkflow } from "@/components/TwoSourceValidationWorkflow";
import { Footer } from "@/components/Footer";
import { track } from "@/lib/analytics";

const TOPIC_TAGS = [
  "SCD2",
  "Snapshots",
  "Temporal Joins",
  "Late Arriving Dimensions",
  "Historical Validation",
];

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const advisorRef = useRef<HTMLDivElement>(null);
  const patternsRef = useRef<HTMLDivElement>(null);
  const validateModelRef = useRef<HTMLDivElement>(null);
  const targetValidationRef = useRef<HTMLDivElement>(null);
  const advancedValidationRef = useRef<HTMLDivElement>(null);

  function scrollToSection(ref: React.RefObject<HTMLDivElement | null>) {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 900);

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    track("page_view", {
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 24% 8%, #2563eb 0, #1e3a8a 22%, #0f172a 54%, #020617 100%)",
        padding: isMobile ? "18px 10px" : "44px 40px",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1320,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <section style={{ marginBottom: isMobile ? 22 : 34 }}>
          <div
            style={{
              maxWidth: 920,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "7px 12px",
                  borderRadius: 999,
                  background: "#dbeafe",
                  color: "#075985",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 0.6,
                  marginBottom: 16,
                }}
              >
                HISTORICAL DATA ENGINEERING TOOLKIT
              </div>

              <h1
                style={{
                  margin: 0,
                  maxWidth: 880,
                  fontSize: isMobile ? 32 : 60,
                  lineHeight: 1.02,
                  letterSpacing: isMobile ? "-0.045em" : "-0.06em",
                  color: "#ffffff",
                }}
              >
                Build reliable historized and snapshot reporting models.
              </h1>

              <p
                style={{
                  margin: "18px 0 0",
                  maxWidth: 780,
                  fontSize: isMobile ? 17 : 21,
                  lineHeight: 1.5,
                  color: "#dbeafe",
                }}
              >
                A practical workbench for Data Engineers working with SCD2
                dimensions, bitemporal history, snapshot reporting,
                late-arriving data and temporal joins.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 22,
                }}
              >
                {TOPIC_TAGS.map((item) => (
                  <span
                    key={item}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: "rgba(219, 234, 254, 0.14)",
                      border: "1px solid rgba(191, 219, 254, 0.28)",
                      color: "#dbeafe",
                      fontSize: 12,
                      fontWeight: 900,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
        <WorkflowSection
          isMobile={isMobile}
          onOpenAdvisor={() => scrollToSection(advisorRef)}
          onOpenPatterns={() => scrollToSection(patternsRef)}
          onOpenModelReview={() => scrollToSection(validateModelRef)}
          onOpenTargetValidation={() => scrollToSection(targetValidationRef)}
          onOpenAdvancedInvestigation={() =>
            scrollToSection(advancedValidationRef)
          }
        />

        <div id="advisor-section" ref={advisorRef}>
          <AdvisorPanel />
        </div>

        <div ref={patternsRef}>
          <PatternEntrySection isMobile={isMobile} />
        </div>

        <div id="model-review-section" ref={validateModelRef}>
          <ModelReviewPanel />
        </div>

        <div id="target-table-validation" ref={targetValidationRef}>
          <TargetTableValidationPanel />
        </div>

        <div ref={advancedValidationRef}>
          <AdvancedInvestigationSection isMobile={isMobile}>
            <TwoSourceValidationWorkflow />
          </AdvancedInvestigationSection>
        </div>

        <Footer />
      </div>

      <Analytics />
    </main>
  );
}

function WorkflowSection({
  isMobile,
  onOpenAdvisor,
  onOpenPatterns,
  onOpenModelReview,
  onOpenTargetValidation,
  onOpenAdvancedInvestigation,
}: {
  isMobile: boolean;
  onOpenAdvisor: () => void;
  onOpenPatterns: () => void;
  onOpenModelReview: () => void;
  onOpenTargetValidation: () => void;
  onOpenAdvancedInvestigation: () => void;
}) {
  const steps = [
    {
      step: "design_model",
      title: "Design your model",
      text: "Use the Advisor to identify historical modeling patterns, architecture options, risks and engineering decisions.",
      button: "Open Advisor →",
      onClick: onOpenAdvisor,
    },
    {
      step: "learn_pattern",
      title: "Learn the pattern",
      text: "Explore practical examples for SCD2, bitemporal modeling, snapshot reporting, dimension completion and temporal joins.",
      button: "Browse Pattern Catalog →",
      onClick: onOpenPatterns,
    },
    {
      step: "review_model",
      title: "Review your model",
      text: "Describe your model logic and get feedback on assumptions, historical risks and missing validation checks.",
      button: "Review My Model →",
      onClick: onOpenModelReview,
    },
    {
      step: "validate_output",
      title: "Validate generated output",
      text: "Paste a generated historical target table and validate coverage, overlaps, gaps and snapshot consistency.",
      button: "Open Validation →",
      onClick: onOpenTargetValidation,
    },
  ];

  return (
    <section
      style={{
        marginBottom: 24,
        padding: isMobile ? 18 : 26,
        borderRadius: 24,
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 22px 60px rgba(15, 23, 42, 0.28)",
      }}
    >
      <div style={{ maxWidth: 850, marginBottom: 22 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            color: "#2563eb",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 8,
          }}
        >
          Start here
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: isMobile ? 26 : 36,
            letterSpacing: "-0.045em",
            color: "#0f172a",
          }}
        >
          Historical modeling workflow
        </h2>

        <p
          style={{
            margin: "12px 0 0",
            maxWidth: 820,
            color: "#475569",
            fontSize: 16,
            lineHeight: 1.6,
          }}
        >
          Start with the question you are facing right now. The workbench helps
          you move from modeling problem to pattern, implementation decision,
          validation and advanced debugging.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 14,
        }}
      >
          {steps.map((item) => (
        <div
          key={item.step}
          style={{
            display: "flex",
            flexDirection: "column",
            padding: 18,
            borderRadius: 18,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            {item.title}
          </h3>
          <p
            style={{
              margin: "10px 0 18px",
              color: "#475569",
              fontSize: 14,
              lineHeight: 1.55,
              flex: 1,
            }}
          >
            {item.text}
          </p>
          <button
            type="button"
            onClick={() => {
              track("workflow_step_clicked", {
                step: item.step,
              });
              item.onClick();
            }}
            style={{
              alignSelf: "flex-start",
              border: "none",
              borderRadius: 13,
              padding: "12px 14px",
              background: "#0f172a",
              color: "#ffffff",
              fontWeight: 900,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {item.button}
          </button>
        </div>
      ))}
      </div>
      <div
        style={{
          marginTop: 24,
          padding: 18,
          borderRadius: 18,
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            color: "#2563eb",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Advanced Investigation
        </div>
        
        <h3
          style={{
            margin: 0,
            fontSize: 20,
            color: "#0f172a",
          }}
        >
          Debug historical source behavior
        </h3>
        
        <p
          style={{
            marginTop: 10,
            color: "#475569",
            lineHeight: 1.6,
          }}
        >
          Compare historized sources, inspect temporal joins,
          investigate gaps, overlaps, ambiguous matches and
          visible-time behavior.
        </p>
        
        <button
          type="button"
          onClick={() => {
            track("workflow_step_clicked", {
              step: "advanced_investigation",
            });
          
            onOpenAdvancedInvestigation();
          }}
          style={{
            marginTop: 14,
            border: "none",
            borderRadius: 13,
            padding: "12px 14px",
            background: "#2563eb",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Open Advanced Investigation →
        </button>
      </div>
    </section>
  );
}

function PatternEntrySection({ isMobile }: { isMobile: boolean }) {
  const patterns = [
    {
      title: "State ↔ State Alignment",
      href: "/learn/state-state-alignment",
      text: "Join two historized state sources across overlapping valid-time intervals.",
    },
    {
      title: "Dimension Completion",
      href: "/learn/dimension-completion",
      text: "Fill missing dimension history before joining facts to dimensions.",
    },
    {
      title: "Snapshot Reproducibility",
      href: "/learn/snapshot-reproducibility",
      text: "Make historical reports rebuildable with the same result.",
    },
    {
      title: "Historical Conformance",
      href: "/learn/historical-conformance",
      text: "Align multiple historical source timelines into one reporting history.",
    },
  ];

  return (
    <section
      style={{
        marginBottom: 24,
        padding: isMobile ? 18 : 24,
        borderRadius: 22,
        background: "rgba(15, 23, 42, 0.72)",
        border: "1px solid rgba(148, 163, 184, 0.32)",
        color: "#e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: "#93c5fd",
              textTransform: "uppercase",
              letterSpacing: 0.7,
              marginBottom: 8,
            }}
          >
            Pattern Catalog
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: isMobile ? 24 : 30,
              letterSpacing: "-0.04em",
              color: "#ffffff",
            }}
          >
            Historical Modeling Pattern Catalog
          </h2>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              maxWidth: 760,
              color: "#cbd5e1",
              fontSize: 15,
              lineHeight: 1.55,
            }}
          >
            Browse practical patterns for historized sources, temporal joins, snapshot
            reporting and bitemporal validation.
          </p>
        </div>

        <a
          href="/patterns"
          onClick={() => {
            track("pattern_catalog_clicked", {
              source: "homepage_pattern_entry",
            });
          }}
          style={{
            alignSelf: isMobile ? "stretch" : "flex-start",
            display: "inline-flex",
            justifyContent: "center",
            padding: "12px 15px",
            borderRadius: 14,
            background: "#2563eb",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          Browse Pattern Catalog →
        </a>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {patterns.map((pattern) => (
          <a
            key={pattern.href}
            href={pattern.href}
            onClick={() => {
              track("related_pattern_clicked", {
                from: "homepage_pattern_entry",
                to: pattern.href.replace("/learn/", "").replaceAll("-", "_"),
              });
            }}
            style={{
              display: "block",
              padding: 16,
              borderRadius: 16,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(191, 219, 254, 0.22)",
              color: "#ffffff",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 900,
                marginBottom: 8,
                color: "#bfdbfe",
              }}
            >
              {pattern.title}
            </div>

            <div
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: "#cbd5e1",
              }}
            >
              {pattern.text}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function AdvancedInvestigationSection({
  isMobile,
  children,
}: {
  isMobile: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        marginTop: 24,
        marginBottom: 28,
        padding: isMobile ? 18 : 26,
        borderRadius: 24,
        background: "rgba(15, 23, 42, 0.72)",
        border: "1px solid rgba(148, 163, 184, 0.32)",
        color: "#e2e8f0",
      }}
    >
      <div style={{ maxWidth: 820, marginBottom: 22 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            color: "#93c5fd",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 8,
          }}
        >
          Advanced investigation
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: isMobile ? 26 : 34,
            letterSpacing: "-0.045em",
            color: "#ffffff",
          }}
        >
          Debug historical source behavior
        </h2>

        <p
          style={{
            margin: "12px 0 0",
            color: "#cbd5e1",
            fontSize: 16,
            lineHeight: 1.6,
          }}
        >
          Use this when you need to compare two historized sources, inspect
          temporal joins, investigate gaps, overlaps, ambiguous matches or
          visible-time behavior.
        </p>
      </div>

      {children}
    </section>
  );
}