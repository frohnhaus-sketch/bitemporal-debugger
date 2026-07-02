"use client";

import { useEffect, useState } from "react";
import { AdvisorPanel } from "@/components/AdvisorPanel";
import { TargetTableValidationPanel } from "@/components/TargetTableValidationPanel";
import { TwoSourceValidationWorkflow } from "@/components/TwoSourceValidationWorkflow";
import { Footer } from "@/components/Footer";
import { track } from "@/lib/analytics";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [investigationCompleted, setInvestigationCompleted] = useState(false);

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
        padding: isMobile ? "14px 10px" : "28px 32px",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: investigationCompleted ? 1100 : 1320,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <TargetTableValidationPanel
          onInvestigationCompleted={() =>
            setInvestigationCompleted(true)
          }
        />

        {investigationCompleted ? (
          <>
            <SupportingWorkflows isMobile={isMobile} />
          </>
        ) : (
          <>
            <section
              id="advisor-section"
              style={{
                marginTop: 24,
              }}
            >
              <AdvisorPanel />
            </section>

            <AdvancedInvestigationSection isMobile={isMobile}>
              <TwoSourceValidationWorkflow />
            </AdvancedInvestigationSection>
          </>
        )}

        <Footer />
      </div>
    </main>
  );
}

function SupportingWorkflows({
  isMobile,
}: {
  isMobile: boolean;
}) {
  const links = [
    {
      title: "Learn historical modeling",
      text: "Understand SCD2, bitemporal modeling, snapshot reproducibility and temporal joins.",
      href: "/patterns",
      cta: "Open Pattern Catalog →",
      event: "patterns",
    },
    {
      title: "Design a better model",
      text: "Answer a few questions and get a recommended historical modeling strategy.",
      href: "#advisor-section",
      cta: "Open Advisor →",
      event: "advisor",
    },
    {
      title: "Compare two sources",
      text: "Investigate temporal joins, visibility lag, overlaps, gaps and historical inconsistencies.",
      href: "#advanced-investigation",
      cta: "Open Advanced Investigation →",
      event: "advanced_investigation",
    },
  ];

  return (
    <section
      style={{
        marginTop: 40,
        marginBottom: 28,
        padding: isMobile ? 18 : 24,
        borderRadius: 24,
        background: "rgba(15, 23, 42, 0.76)",
        border: "1px solid rgba(148,163,184,0.34)",
        color: "#e2e8f0",
      }}
    >
      <div style={{ maxWidth: 820, marginBottom: 20 }}>
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
          Continue your investigation
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: isMobile ? 25 : 32,
            letterSpacing: "-0.04em",
            color: "#ffffff",
          }}
        >
          Where do you want to go next?
        </h2>

        <p
          style={{
            margin: "10px 0 0",
            maxWidth: 760,
            color: "#cbd5e1",
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          Your investigation is complete. Continue by understanding the
          underlying modeling pattern, improving your design or comparing
          historical source tables.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(auto-fit,minmax(260px,1fr))",
          gap: 14,
        }}
      >
        {links.map((item) => (
          <a
            key={item.event}
            href={item.href}
            onClick={() =>
              track("supporting_workflow_clicked", {
                workflow: item.event,
              })
            }
            style={{
              display: "block",
              padding: 18,
              borderRadius: 18,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(191,219,254,0.22)",
              color: "#ffffff",
              textDecoration: "none",
            }}
          >
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: 18,
              }}
            >
              {item.title}
            </h3>

            <p
              style={{
                margin: "0 0 14px",
                color: "#cbd5e1",
                fontSize: 14,
                lineHeight: 1.55,
              }}
            >
              {item.text}
            </p>

            <div
              style={{
                color: "#93c5fd",
                fontWeight: 900,
                fontSize: 14,
              }}
            >
              {item.cta}
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
      id="advanced-investigation"
      style={{
        marginTop: 24,
        marginBottom: 28,
        padding: isMobile ? 18 : 26,
        borderRadius: 24,
        background:
          "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(30,41,59,0.9))",
        border: "1px solid rgba(96,165,250,0.35)",
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
          }}
        >
          Compare Historical Sources
        </h2>

        <p
          style={{
            margin: "12px 0 0",
            color: "#cbd5e1",
            fontSize: 16,
            lineHeight: 1.6,
          }}
        >
          Use this expert workflow after the model exists and you need row-level
          temporal evidence for joins, gaps, overlaps or visibility issues.
        </p>
      </div>

      {children}
    </section>
  );
}