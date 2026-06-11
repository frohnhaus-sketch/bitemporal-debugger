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

  const [showExampleModel, setShowExampleModel] = useState(false);

  const exampleModelRef = useRef<HTMLDivElement>(null);
  const validateModelRef = useRef<HTMLDivElement>(null);
  const twoSourceRef = useRef<HTMLDivElement>(null);

  function openExampleModel() {
    setShowExampleModel(true);

    track("example_model_opened", {
      source: "activation_section",
      example: "dimension_completion",
    });

    setTimeout(() => {
      exampleModelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  function scrollToValidateModel() {
    track("activation_cta_clicked", {
      cta: "review_my_model",
    });

    validateModelRef.current?.scrollIntoView({
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

        <div id="advisor-section">
          <AdvisorPanel />
        </div>

        <ActivationSection
          isMobile={isMobile}
          showExampleModel={showExampleModel}
          onSeeExampleModel={openExampleModel}
          onValidateOwnModel={scrollToValidateModel}
          exampleModelRef={exampleModelRef}
        />

        <div id="model-review-section" ref={validateModelRef}>
          <ModelReviewPanel />
        </div>

        <TargetTableValidationPanel />

        <div ref={twoSourceRef}>
          <TwoSourceValidationWorkflow />
        </div>

        <Footer />
      </div>

      <Analytics />
    </main>
  );
function ActivationSection({
  isMobile,
  showExampleModel,
  onSeeExampleModel,
  onValidateOwnModel,
  exampleModelRef,
}: {
  isMobile: boolean;
  showExampleModel: boolean;
  onSeeExampleModel: () => void;
  onValidateOwnModel: () => void;
  exampleModelRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <section
      style={{
        marginTop: 18,
        marginBottom: 28,
        background: "#ffffff",
        borderRadius: 22,
        padding: isMobile ? 18 : 28,
        boxShadow: "0 22px 60px rgba(15, 23, 42, 0.28)",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 18,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: "#2563eb",
              letterSpacing: 0.6,
              marginBottom: 8,
            }}
          >
            TYPICAL USE CASES
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: isMobile ? 24 : 32,
              letterSpacing: "-0.04em",
              color: "#0f172a",
            }}
          >
            See how the recommendation looks in a real model.
          </h2>

          <p
            style={{
              margin: "12px 0 0",
              fontSize: 16,
              lineHeight: 1.55,
              color: "#475569",
            }}
          >
            Most historical modeling problems are easier to understand once you
            see the fact table, dimension table, join logic and snapshot logic
            together.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          <InfoBox
            title="Typical use cases"
            items={[
              "Month-end reporting",
              "Snapshot reproducibility",
              "Corrected history",
              "Late arriving dimensions",
            ]}
          />

          <InfoBox
            title="Typical challenges"
            items={[
              "Dimension completion",
              "Historical joins",
              "Relationship history",
              "Missing dimension rows",
            ]}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 12,
          marginTop: 22,
        }}
      >
        <button
          onClick={onSeeExampleModel}
          style={{
            border: "none",
            borderRadius: 14,
            padding: "15px 20px",
            background: "#2563eb",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: 15,
            cursor: "pointer",
            boxShadow: "0 14px 30px rgba(37, 99, 235, 0.28)",
          }}
        >
          See Example Model
        </button>

        <button
          onClick={onValidateOwnModel}
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: 14,
            padding: "15px 20px",
            background: "#ffffff",
            color: "#0f172a",
            fontWeight: 900,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Review My Model
        </button>
      </div>

      {showExampleModel && (
        <div ref={exampleModelRef}>
          <ExampleModel isMobile={isMobile} />
        </div>
      )}
    </section>
  );
}

function InfoBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 16,
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 900,
          color: "#0f172a",
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((item) => (
          <span
            key={item}
            style={{
              padding: "7px 10px",
              borderRadius: 999,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              color: "#334155",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

  function ExampleModel({ isMobile }: { isMobile: boolean }) {
    return (
      <div
        style={{
          marginTop: 26,
          borderTop: "1px solid #e2e8f0",
          paddingTop: 24,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            padding: "7px 11px",
            borderRadius: 999,
            background: "#eff6ff",
            color: "#1d4ed8",
            fontSize: 12,
            fontWeight: 900,
            marginBottom: 12,
          }}
        >
          EXAMPLE MODEL · DIMENSION COMPLETION
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: isMobile ? 22 : 28,
            letterSpacing: "-0.035em",
            color: "#0f172a",
          }}
        >
          Completing customer history for month-end contract snapshots
        </h3>

        <p
          style={{
            margin: "10px 0 20px",
            color: "#475569",
            fontSize: 15,
            lineHeight: 1.55,
            maxWidth: 820,
          }}
        >
          A contract fact exists for every month-end snapshot. The customer
          dimension changes independently and may not contain a row for every
          contract snapshot period. Dimension completion fills the missing
          historical context before the snapshot model is joined.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 14,
          }}
        >
          <ModelCard
            title="Fact table"
            subtitle="contract_month_snapshot"
            rows={[
              "contract_id",
              "customer_id",
              "snapshot_month",
              "premium_amount",
              "status",
            ]}
          />

          <ModelCard
            title="Historized dimension"
            subtitle="dim_customer_scd2"
            rows={[
              "customer_id",
              "customer_segment",
              "valid_from",
              "valid_to",
              "visible_from",
              "visible_to",
            ]}
          />

          <ModelCard
            title="Join logic"
            subtitle="as-of snapshot join"
            rows={[
              "fact.customer_id = dim.customer_id",
              "snapshot_month >= valid_from",
              "snapshot_month < valid_to",
              "report_run_time >= visible_from",
            ]}
          />

          <ModelCard
            title="Snapshot logic"
            subtitle="month-end reproducibility"
            rows={[
              "One fact row per contract and month",
              "Dimension state resolved as of month-end",
              "Corrected history controlled by visible time",
              "Missing dimension periods are completed first",
            ]}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 12,
            marginTop: 24,
          }}
        >
          <button
            onClick={() => {
              track("example_model_cta_clicked", {
                cta: "review_my_model",
              });
            
              document
                .getElementById("model-review-section")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            style={{
              border: "none",
              borderRadius: 14,
              padding: "15px 20px",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 900,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 14px 30px rgba(37, 99, 235, 0.24)",
            }}
          >
            Review My Model
          </button>
          <button
            onClick={() => {
              track("example_model_cta_clicked", {
                cta: "explore_more_patterns",
              });
            
              window.location.href = "/patterns";
            }}
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: 14,
              padding: "15px 20px",
              background: "#ffffff",
              color: "#0f172a",
              fontWeight: 900,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Explore More Patterns
          </button>
        </div>
      </div>
    );
  }

  function ModelCard({
    title,
    subtitle,
    rows,
  }: {
    title: string;
    subtitle: string;
    rows: string[];
  }) {
    return (
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: 16,
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 900,
            color: "#0f172a",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 4,
            marginBottom: 12,
            fontSize: 12,
            color: "#64748b",
            fontWeight: 800,
          }}
        >
          {subtitle}
        </div>

        <div style={{ display: "grid", gap: 7 }}>
          {rows.map((row) => (
            <code
              key={row}
              style={{
                display: "block",
                padding: "8px 10px",
                borderRadius: 10,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                color: "#334155",
                fontSize: 12,
              }}
            >
              {row}
            </code>
          ))}
        </div>
      </div>
    );
  }
}